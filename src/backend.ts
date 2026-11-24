// Backend worker: stores profiles per user and applies them to presets through the presets permission.

declare const spindle: import('lumiverse-spindle-types').SpindleAPI;

import {
  applyProfile, describePreset, editorBlocks, samplerDisabledWarning, exportProfiles, importProfiles, normalizeProfile, normalizeStore, uniqueName, undoBackup,
  type CommitResult, type PresetHost, type PresetLike,
} from './core';
import { type Profile, type Store, type StateMsg, type ToBackend, type ToFrontend, newId } from './shared';

const STORE_PATH = 'profiles.json';

const SOURCE_LABEL: Record<string, string> = {
  chat: '채팅', persona: '페르소나', character: '캐릭터', connection: '연결', defaults: '기본값',
};

function send(payload: ToFrontend, userId: string, sessionId?: string): void {
  spindle.sendToFrontend(payload, userId, sessionId ? { frontendSessionId: sessionId } : undefined);
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

async function active(userId: string, chatId: string | null): Promise<{ id: string | null; source: string | null }> {
  try {
    const a = await spindle.presets.getActive(chatId ?? undefined, userId);
    return { id: a.preset_id ?? null, source: a.source ?? null };
  } catch {
    return { id: null, source: null };
  }
}

const lastChat = new Map<string, string>();

async function stateMsg(userId: string, chatIdIn: string | null, store?: Store, refreshList = false): Promise<StateMsg> {
  if (chatIdIn) lastChat.set(userId, chatIdIn);
  const chatId = chatIdIn ?? lastChat.get(userId) ?? null;
  const s = store ?? (await loadStore(userId));
  const [presets, act] = await Promise.all([listPresets(userId, refreshList).catch(() => presetCache.get(userId) ?? []), active(userId, chatId)]);
  return {
    type: 'state', profiles: s.profiles, backups: s.backups, settings: s.settings,
    presets, activePresetId: act.id, activeSource: act.source,
  };
}

function describeResult(r: CommitResult, what: string): { level: 'info' | 'warning' | 'error'; text: string } {
  switch (r.status) {
    case 'applied': {
      const skip = r.skipped.length ? ` (프리셋에 없는 변수 ${r.skipped.length}개는 건너뜀)` : '';
      return { level: r.skipped.length ? 'warning' : 'info', text: `${what}했습니다.${skip}` };
    }
    case 'noop':
      return { level: 'info', text: `${what}: 이미 같은 값이라 바꿀 것이 없습니다.` };
    case 'missing':
      return { level: 'error', text: '대상 프리셋을 찾을 수 없습니다. 삭제되었거나 다른 계정의 프리셋일 수 있습니다.' };
    case 'conflict':
      return { level: 'error', text: '다른 곳에서 프리셋이 바뀌어 적용하지 못했습니다. 잠시 뒤 다시 시도하세요.' };
  }
}

async function doApply(
  userId: string, sessionId: string | undefined, store: Store, profile: Profile,
  chatId: string | null, activeConnectionId: string | null, switched: boolean, auto: boolean, editorPresetId?: string | null,
): Promise<void> {
  if (editorBlocks(editorPresetId, profile.presetId)) {
    const text = auto
      ? `'${profile.name}' 자동 적용을 건너뛰었습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 직접 적용하세요.`
      : `'${profile.name}' 적용을 취소했습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있어, 적용값이 편집기의 옛 값에 덮일 수 있습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 다시 적용하세요.`;
    if (auto) spindle.toast.warning(text, { userId });
    send({ type: 'result', level: 'warning', text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  const target = switched ? profile.connectionId : null;
  const r = await applyProfile(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target });
  await saveStore(userId, store);
  const d = describeResult(r, auto ? `'${profile.name}' 자동 적용` : `'${profile.name}' 적용`);
  let text = d.text;
  let level = d.level;
  if (r.status === 'applied' || r.status === 'noop') {
    const w = samplerDisabledWarning(r.preset, profile);
    if (w) {
      text += `\n${w}`;
      level = 'warning';
    }
  }
  if ((r.status === 'applied' || r.status === 'noop') && Object.keys(profile.variables).length) {
    const act = await active(userId, chatId);
    if (act.source && act.source !== 'none') {
      text += `\n이 채팅에는 프리셋 프로필 바인딩(${SOURCE_LABEL[act.source] ?? act.source})이 있어, 프롬프트 변수 값이 그 바인딩 값에 가려질 수 있습니다.`;
      level = 'warning';
    }
  }
  if (auto && (r.status !== 'noop' || level === 'warning')) spindle.toast[level](text.slice(0, 500), { userId });
  send({ type: 'result', level, text, presetId: profile.presetId, switchConnection: r.status === 'applied' || r.status === 'noop' ? target : undefined }, userId, auto ? undefined : sessionId);
  send(await stateMsg(userId, chatId, store), userId, sessionId);
}

async function handle(msg: ToBackend, userId: string, sessionId: string | undefined): Promise<void> {
  switch (msg.type) {
    case 'load':
      send(await stateMsg(userId, msg.chatId, undefined, true), userId, sessionId);
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
          send({ type: 'result', level: 'error', text: '이름과 대상 프리셋이 필요합니다.' }, userId, sessionId);
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
        send({ type: 'result', level: 'info', text: `'${incoming.name}' 프로필을 저장했습니다.` }, userId, sessionId);
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
          send({ type: 'result', level: 'error', text: '프로필을 찾을 수 없습니다.' }, userId, sessionId);
          return;
        }
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.activeConnectionId, msg.switched, false, msg.editorPresetId);
      });
      return;

    case 'connection_changed':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (!store.settings.autoApply || !msg.connectionId) return;
        const act = await active(userId, msg.chatId);
        if (!act.id) return;
        const profile = store.profiles.find((p) => p.presetId === act.id && p.autoConnectionIds.includes(msg.connectionId!));
        if (!profile) return;
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.connectionId, false, true, msg.editorPresetId);
      });
      return;

    case 'undo':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const backup = store.backups[msg.presetId];
        if (editorBlocks(msg.editorPresetId, msg.presetId)) {
          send({ type: 'result', level: 'warning', text: '되돌리기를 취소했습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 다시 시도하세요.', presetId: msg.presetId }, userId, sessionId);
          return;
        }
        const r = await undoBackup(hostFor(userId), store, msg.presetId);
        await saveStore(userId, store);
        const d = describeResult(r, '되돌림');
        const text = r.status === 'applied' ? '직전 값으로 되돌렸습니다.' : r.status === 'missing' && !backup ? '되돌릴 백업이 없습니다.' : d.text;
        const ok = r.status === 'applied' || r.status === 'noop';
        send({ type: 'result', level: d.level, text, presetId: msg.presetId, switchConnection: ok && backup?.connectionSwitchedTo ? backup.connectionBefore : undefined }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;

    case 'export': {
      const store = await loadStore(userId);
      send({ type: 'export', text: exportProfiles(store, msg.ids), filename: 'setting-profiles.json' }, userId, sessionId);
      return;
    }

    case 'import':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const r = importProfiles(store, msg.text);
        if (r.added) await saveStore(userId, store);
        const text = r.added ? `${r.added}개를 가져왔습니다.` : '가져온 프로필이 없습니다.';
        send({ type: 'result', level: r.errors.length ? 'warning' : 'info', text: [text, ...r.errors].join('\n') }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;

    case 'set_settings':
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (typeof msg.settings.autoApply === 'boolean') store.settings.autoApply = msg.settings.autoApply;
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
    spindle.toast.error(e instanceof Error ? e.message : String(e), { userId });
  });
});
