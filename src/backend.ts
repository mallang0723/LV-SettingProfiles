// Backend worker: stores profiles per user and applies them to presets through the presets permission.

import { message, joinMessages, renderMessage, LocalizedError, type LocalizedMessage, type Language, type MessageKey } from './i18n';
declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import {
  applyProfile, applyProfileViaEditor, fallbackMessage, describePreset, resolveActive, writeRoute, samplerDisabledWarning, exportProfiles, importProfiles, normalizeProfile, normalizeStore,
  uniqueName, undoBackup, undoBackupViaEditor,
  type CommitResult, type EditorCommitResult, type EditorSampler, type PresetHost, type PresetLike,
} from './core';
import { type EditorInfo, type Profile, type Store, type StateMsg, type ToBackend, type ToFrontend, newId } from './shared';

const STORE_PATH = 'profiles.json';

const SOURCE_KEYS: Record<string, MessageKey> = {
  chat: 'source_chat', persona: 'source_persona', character: 'source_character', connection: 'source_connection', defaults: 'source_defaults',
};

function send(payload: ToFrontend, userId: string, sessionId?: string): void {
  spindle.sendToFrontend(payload, userId, sessionId ? { frontendSessionId: sessionId } : undefined);
}

// Keep text for older frontends; current frontends retain the descriptor and render in their current language.
type Result = Extract<ToFrontend, { type: 'result' }>;
type LocalizedResult = Omit<Result, 'text'> & { text: LocalizedMessage };
function localizedSender(language: Language) {
  return (payload: Exclude<ToFrontend, Result> | LocalizedResult, userId: string, sessionId?: string) => {
    if (payload.type === 'result') send({ ...payload, message: payload.text, text: renderMessage(language, payload.text) }, userId, sessionId);
    else send(payload, userId, sessionId);
  };
}

// One queue per user so that read-modify-write on the store never interleaves.
const queues = new Map<string, Promise<unknown>>();
function serial<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const prev = queues.get(userId) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  queues.set(userId, next.catch(() => undefined));
  return next;
}

async function loadStore(userId: string): Promise<Store> {
  return normalizeStore(await spindle.userStorage.getJson<unknown>(STORE_PATH, { fallback: null, userId }));
}

async function saveStore(userId: string, store: Store): Promise<void> {
  await spindle.userStorage.setJson(STORE_PATH, store, { indent: 2, userId });
}

function hostFor(userId: string): PresetHost {
  return {
    async get(id) {
      return (await spindle.presets.get(id, userId)) as unknown as PresetLike | null;
    },
    async update(id, input) {
      return (await spindle.presets.update(id, input as never, userId)) as unknown as PresetLike;
    },
  };
}

// The host has no summary endpoint: presets.list returns full rows (blocks included), capped at 200.
// So the list is fetched once per tab open / explicit refresh and cached per user.
const presetCache = new Map<string, Array<{ id: string; name: string }>>();

async function listPresets(userId: string, refresh: boolean): Promise<Array<{ id: string; name: string }>> {
  const cached = presetCache.get(userId);
  if (cached && !refresh) return cached;
  const r = await spindle.presets.list({ limit: 200, userId });
  const out = r.data.map((p) => ({ id: p.id, name: p.name }));
  presetCache.set(userId, out);
  return out;
}

// Which preset is active. The worker runtime of some hosts (1.2.5) has no presets.getActive, so the frontend reads the
// active preset id from its own state (`loom.activePresetId`) and sends it as `hint`: undefined = the frontend could not tell.
// getActive, when the host has it, only adds the binding source (and answers when there is no hint).
const lastHint = new Map<string, string | null>();

async function active(userId: string, chatId: string | null, hint?: string | null): Promise<{ id: string | null; source: string | null; known: boolean }> {
  if (hint !== undefined) lastHint.set(userId, hint);
  let api: { preset_id?: string | null; source?: string | null } | null = null;
  const getActive = (spindle.presets as { getActive?: (chatId?: string, userId?: string) => Promise<{ preset_id?: string | null; source?: string | null }> }).getActive;
  if (typeof getActive === 'function') {
    try { api = await getActive.call(spindle.presets, chatId ?? undefined, userId); } catch { /* host without a working call: use the hint */ }
  }
  return resolveActive(hint, api, lastHint.get(userId));
}

const lastChat = new Map<string, string>();

// Requests to the frontend to change the open editor's draft; answered by an `editor_reply` message.
const editorWaits = new Map<string, { resolve: (v: { changed: boolean; prev: Record<string, import('./shared').Prev> }) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();

function askEditor(userId: string, sessionId: string | undefined, presetId: string, language: Language): EditorSampler {
  const t = message;
  return (patch) => new Promise((resolve, reject) => {
    if (!sessionId) { reject(new LocalizedError(t('editorSessionMissing'), language)); return; }
    const reqId = newId('ed');
    const timer = setTimeout(() => { editorWaits.delete(reqId); reject(new LocalizedError(t('editorTimeout'), language)); }, 15000);
    editorWaits.set(reqId, { resolve, reject, timer });
    send({ type: 'editor_patch', reqId, presetId, set: patch.set, remove: patch.remove }, userId, sessionId);
  });
}


async function stateMsg(userId: string, chatIdIn: string | null, store?: Store, refreshList = false, hint?: string | null): Promise<StateMsg> {
  if (chatIdIn) lastChat.set(userId, chatIdIn);
  const chatId = chatIdIn ?? lastChat.get(userId) ?? null;
  const s = store ?? (await loadStore(userId));
  const [presets, act] = await Promise.all([listPresets(userId, refreshList).catch(() => presetCache.get(userId) ?? []), active(userId, chatId, hint)]);
  return {
    type: 'state', profiles: s.profiles, backups: s.backups, settings: s.settings,
    presets, activePresetId: act.id, activeSource: act.source, activeAvailable: act.known,
  };
}

function describeResult(r: CommitResult, what: LocalizedMessage): { level: 'info' | 'warning' | 'error'; text: LocalizedMessage } {
  const t = message;
  switch (r.status) {
    case 'applied': {
      const skip = r.skipped.length ? t('skippedVariables', { count: r.skipped.length }) : '';
      return { level: r.skipped.length ? 'warning' : 'info', text: t('appliedResult', { action: what, skip }) };
    }
    case 'noop':
      return { level: 'info', text: t('noopResult', { action: what }) };
    case 'missing':
      return { level: 'error', text: t('presetMissing') };
    case 'conflict':
      return { level: 'error', text: t('conflict') };
  }
}

async function doApply(
  userId: string, sessionId: string | undefined, store: Store, profile: Profile,
  chatId: string | null, activeConnectionId: string | null, switched: boolean, auto: boolean, ed: EditorInfo = {}, activeHint?: string | null, language: Language = 'ko',
): Promise<void> {
  const t = message;
  const send = localizedSender(language);
  const route = writeRoute(ed, profile.presetId, !!sessionId);
  const editorOpen = route === 'editor';
  if (route === 'refuse') {
    const text = auto
      ? t('autoRefused', { name: profile.name })
      : t('applyRefused', { name: profile.name });
    if (auto) spindle.toast.warning(renderMessage(language, text), { userId });
    send({ type: 'result', level: 'warning', text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  const target = switched ? profile.connectionId : null;
  let r: EditorCommitResult;
  try {
    r = editorOpen
      ? await applyProfileViaEditor(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target }, askEditor(userId, sessionId, profile.presetId, language), ed.editorBlocksReject)
      : await applyProfile(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target });
  } catch (e) {
    const text = t(auto ? 'autoApplyFailed' : 'applyFailed', { name: profile.name, error: t('unexpectedError') });
    if (auto) spindle.toast.error(renderMessage(language, text).slice(0, 500), { userId });
    send({ type: 'result', level: 'error', text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  await saveStore(userId, store);
  const d = describeResult(r, t(auto ? 'autoApplyAction' : 'applyAction', { name: profile.name }));
  let text = d.text;
  let level = d.level;
  if (r.status === 'applied' || r.status === 'noop') {
    const w = samplerDisabledWarning(r.preset, profile, language);
    if (w) {
      text = joinMessages([text, message('samplerDisabled')], '\n');
      level = 'warning';
    }
  }
  if (r.fallback) {
    if (r.status === 'applied') { text = joinMessages([text, fallbackMessage(r.fallback, Object.keys(profile.variables).length > 0)], '\n'); level = 'warning'; }
  } else if (editorOpen && r.status === 'applied' && Object.keys(profile.variables).length) text = joinMessages([text, t('editorVariablesNote')], '\n');
  if ((r.status === 'applied' || r.status === 'noop') && Object.keys(profile.variables).length) {
    const act = await active(userId, chatId, activeHint);
    if (act.source && act.source !== 'none') {
      text = joinMessages([text, t('bindingWarning', { source: SOURCE_KEYS[act.source] ? t(SOURCE_KEYS[act.source]!) : act.source })]);
      level = 'warning';
    }
  }
  if (auto && (r.status !== 'noop' || level === 'warning')) spindle.toast[level](renderMessage(language, text).slice(0, 500), { userId });
  send({ type: 'result', level, text, presetId: profile.presetId, switchConnection: r.status === 'applied' || r.status === 'noop' ? target : undefined }, userId, auto ? undefined : sessionId);
  send(await stateMsg(userId, chatId, store, false, activeHint), userId, sessionId);
}

async function handle(msg: ToBackend, userId: string, sessionId: string | undefined): Promise<void> {
  const language = msg.language === 'en' ? 'en' : 'ko';
  const t = message;
  const send = localizedSender(language);
  switch (msg.type) {
    case 'load':
      send(await stateMsg(userId, msg.chatId, undefined, true, msg.activePresetId), userId, sessionId);
      return;

    case 'detail': {
      const p = await hostFor(userId).get(msg.presetId);
      send({ type: 'detail', presetId: msg.presetId, detail: p ? describePreset(p) : null }, userId, sessionId);
      return;
    }

    case 'save_profile': {
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const incoming = normalizeProfile({ ...msg.profile, presetName: msg.profile.presetName ?? '' });
        if (!incoming) {
          send({ type: 'result', level: 'error', text: t('profileFieldsRequired') }, userId, sessionId);
          return;
        }
        const existing = msg.profile.id ? store.profiles.find((p) => p.id === msg.profile.id) : undefined;
        incoming.name = uniqueName(store, incoming.presetId, incoming.name, existing?.id);
        if (existing) {
          incoming.id = existing.id;
          incoming.createdAt = existing.createdAt;
          incoming.updatedAt = Date.now();
          store.profiles[store.profiles.indexOf(existing)] = incoming;
        } else {
          incoming.id = newId('prof');
          store.profiles.push(incoming);
        }
        await saveStore(userId, store);
        send({ type: 'result', level: 'info', text: t('profileSaved', { name: incoming.name }) }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    }

    case 'delete':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        store.profiles = store.profiles.filter((p) => p.id !== msg.id);
        await saveStore(userId, store);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;

    case 'apply':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const profile = store.profiles.find((p) => p.id === msg.id);
        if (!profile) {
          send({ type: 'result', level: 'error', text: t('profileMissing') }, userId, sessionId);
          return;
        }
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.activeConnectionId, msg.switched, false, msg, undefined, language);
      });
      return;

    case 'connection_changed':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (!store.settings.autoApply || !msg.connectionId) return;
        const act = await active(userId, msg.chatId, msg.activePresetId);
        if (!act.known) {
          if (store.profiles.some((p) => p.autoConnectionIds.includes(msg.connectionId!))) {
            spindle.toast.warning(renderMessage(language, t('autoActiveUnknown')), { userId });
          }
          return;
        }
        if (!act.id) return;
        const profile = store.profiles.find((p) => p.presetId === act.id && p.autoConnectionIds.includes(msg.connectionId!));
        if (!profile) return;
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.connectionId, false, true, msg, msg.activePresetId, language);
      });
      return;

    case 'undo':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const backup = store.backups[msg.presetId];
        const route = writeRoute(msg, msg.presetId, !!sessionId);
        const editorOpen = route === 'editor';
        if (route === 'refuse') {
          send({ type: 'result', level: 'warning', text: t('undoRefused'), presetId: msg.presetId }, userId, sessionId);
          return;
        }
        let r: EditorCommitResult;
        try {
          r = editorOpen
            ? await undoBackupViaEditor(hostFor(userId), store, msg.presetId, askEditor(userId, sessionId, msg.presetId, language), msg.editorBlocksReject)
            : await undoBackup(hostFor(userId), store, msg.presetId);
        } catch (e) {
          send({ type: 'result', level: 'error', text: t('undoFailed', { error: t('unexpectedError') }), presetId: msg.presetId }, userId, sessionId);
          return;
        }
        await saveStore(userId, store);
        const d = describeResult(r, t('undoAction'));
        const hasVars = !!backup && Object.keys(backup.variables).length > 0;
        const text = r.status === 'applied' ? t('undoSuccess', { note: r.fallback ? joinMessages(['\n', fallbackMessage(r.fallback, hasVars)]) : editorOpen && hasVars ? joinMessages(['\n', t('editorVariablesNote')]) : '' }) : r.status === 'missing' && !backup ? t('noBackup') : d.text;
        const ok = r.status === 'applied' || r.status === 'noop';
        send({ type: 'result', level: r.fallback && r.status === 'applied' ? 'warning' : d.level, text, presetId: msg.presetId, switchConnection: ok && backup?.connectionSwitchedTo ? backup.connectionBefore : undefined }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;

    case 'editor_reply': {
      const w = editorWaits.get(msg.reqId);
      if (!w) return;
      editorWaits.delete(msg.reqId);
      clearTimeout(w.timer);
      if (msg.ok) w.resolve({ changed: msg.changed === true, prev: msg.prev ?? {} });
      else w.reject(msg.errorMessage ? new LocalizedError(msg.errorMessage, language) : msg.error ? new Error(msg.error) : new LocalizedError(t('editorReplyFailed'), language));
      return;
    }

    case 'export': {
      const store = await loadStore(userId);
      send({ type: 'export', text: exportProfiles(store, msg.ids), filename: 'setting-profiles.json' }, userId, sessionId);
      return;
    }

    case 'import':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const r = importProfiles(store, msg.text, Date.now(), language);
        if (r.added) await saveStore(userId, store);
        const text = r.added ? t('importCount', { count: r.added }) : t('importEmpty');
        send({ type: 'result', level: r.errors.length ? 'warning' : 'info', text: joinMessages([text, ...r.errorMessages], '\n') }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;

    case 'set_settings':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (typeof msg.settings.autoApply === 'boolean') store.settings.autoApply = msg.settings.autoApply;
        if (msg.settings.language === 'auto' || msg.settings.language === 'ko' || msg.settings.language === 'en') store.settings.language = msg.settings.language;
        await saveStore(userId, store);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;

    case 'notify':
      if (msg.kind === 'info' || msg.kind === 'warning' || msg.kind === 'error') {
        spindle.toast[msg.kind](String(msg.text).slice(0, 500), { userId });
      }
      return;
  }
}

spindle.onFrontendMessage((payload, userId, frontendSessionId) => {
  if (!payload || typeof payload !== 'object' || typeof (payload as { type?: unknown }).type !== 'string') return;
  handle(payload as ToBackend, userId, frontendSessionId).catch((e) => {
    spindle.log.error(`[setting-profiles] ${(payload as { type: string }).type}: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`);
    const language = (payload as ToBackend).language === 'en' ? 'en' : 'ko';
    const t = message;
    const send = localizedSender(language);
    const text = t('unexpectedError');
    spindle.toast.error(renderMessage(language, text), { userId });
    send({ type: 'result', level: 'error', text, refresh: false }, userId, frontendSessionId);
  });
});
