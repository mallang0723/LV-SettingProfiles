// Host-independent logic: partial apply with revision retry, undo, validation, export/import.
// The preset block list, prompts, name and regexes are never part of an update payload.

import { normalizeLanguage, translator, translate, message, joinMessages, renderMessage, LocalizedError, type LocalizedMessage, type MessageKey, type Language } from './i18n';
import {
  type Backup, type Json, type PresetDetail, type SamplerPatch, type Prev, type Profile, type Store, type VariableInfo, type VariableValues,
  BOOLEAN_SAMPLER_KEYS, SAMPLER_KEYS, emptyStore, newId,
} from './shared';

export interface PresetLike {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  metadata: Record<string, unknown>;
  prompt_order: unknown[];
  cache_revision?: number;
}

/** The only fields an update may carry. */
export interface UpdatePayload {
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  expected_cache_revision: number;
}

export interface PresetHost {
  get(id: string): Promise<PresetLike | null>;
  update(id: string, input: UpdatePayload): Promise<PresetLike>;
}

const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isConflict(e: unknown): boolean {
  return !!e && typeof e === 'object' && (e as { code?: unknown }).code === 'PRESET_REVISION_CONFLICT';
}

// ---- validation ----

function cleanSampler(v: unknown): Record<string, Json> {
  const out: Record<string, Json> = {};
  if (!isObj(v)) return out;
  for (const key of SAMPLER_KEYS) {
    if (!Object.hasOwn(v, key)) continue;
    const x = v[key];
    if (BOOLEAN_SAMPLER_KEYS.includes(key)) {
      if (typeof x === 'boolean') out[key] = x;
    } else if (x === null) out[key] = null;
    else if (typeof x === 'number' && Number.isFinite(x)) out[key] = x;
  }
  return out;
}

function cleanJson(v: unknown, depth = 0): Json | undefined {
  if (depth > 4) return undefined;
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (Array.isArray(v)) {
    const out: Json[] = [];
    for (const x of v.slice(0, 500)) {
      const c = cleanJson(x, depth + 1);
      if (c !== undefined) out.push(c);
    }
    return out;
  }
  return undefined;
}

function cleanVariables(v: unknown): VariableValues {
  const out: VariableValues = {};
  if (!isObj(v)) return out;
  for (const [block, bucket] of Object.entries(v)) {
    if (BAD_KEYS.has(block) || !isObj(bucket)) continue;
    const b: Record<string, Json> = {};
    for (const [name, val] of Object.entries(bucket)) {
      if (BAD_KEYS.has(name)) continue;
      const c = cleanJson(val);
      if (c !== undefined) b[name] = c;
    }
    if (Object.keys(b).length) out[block] = b;
  }
  return out;
}

export function normalizeProfile(v: unknown, now = Date.now()): Profile | null {
  if (!isObj(v) || typeof v.name !== 'string' || !v.name.trim() || typeof v.presetId !== 'string' || !v.presetId) return null;
  return {
    id: typeof v.id === 'string' && v.id ? v.id : newId('prof'),
    name: v.name.trim().slice(0, 80),
    presetId: v.presetId,
    presetName: typeof v.presetName === 'string' ? v.presetName.slice(0, 120) : '',
    sampler: cleanSampler(v.sampler),
    variables: cleanVariables(v.variables),
    connectionId: typeof v.connectionId === 'string' && v.connectionId ? v.connectionId : null,
    autoConnectionIds: Array.isArray(v.autoConnectionIds)
      ? [...new Set(v.autoConnectionIds.filter((x): x is string => typeof x === 'string' && !!x))].slice(0, 50)
      : [],
    createdAt: typeof v.createdAt === 'number' ? v.createdAt : now,
    updatedAt: typeof v.updatedAt === 'number' ? v.updatedAt : now,
  };
}

function normalizeBackup(v: unknown): Backup | null {
  if (!isObj(v) || typeof v.presetId !== 'string') return null;
  const prevMap = (m: unknown): Record<string, Prev> => {
    const out: Record<string, Prev> = {};
    if (!isObj(m)) return out;
    for (const [k, p] of Object.entries(m)) {
      if (BAD_KEYS.has(k) || !isObj(p)) continue;
      const val = cleanJson(p.value);
      out[k] = p.had === true ? { had: true, value: val === undefined ? null : val } : { had: false };
    }
    return out;
  };
  const variables: Record<string, Record<string, Prev>> = {};
  if (isObj(v.variables)) {
    for (const [b, m] of Object.entries(v.variables)) if (!BAD_KEYS.has(b)) variables[b] = prevMap(m);
  }
  return {
    presetId: v.presetId,
    profileId: typeof v.profileId === 'string' ? v.profileId : '',
    profileName: typeof v.profileName === 'string' ? v.profileName : '',
    at: typeof v.at === 'number' ? v.at : 0,
    sampler: prevMap(v.sampler),
    variables,
    connectionBefore: typeof v.connectionBefore === 'string' ? v.connectionBefore : null,
    connectionSwitchedTo: typeof v.connectionSwitchedTo === 'string' ? v.connectionSwitchedTo : null,
  };
}

export function normalizeStore(v: unknown): Store {
  if (!isObj(v)) return emptyStore();
  const profiles = (Array.isArray(v.profiles) ? v.profiles : []).map((p) => normalizeProfile(p)).filter((p): p is Profile => !!p);
  const backups: Record<string, Backup> = {};
  if (isObj(v.backups)) {
    for (const [k, b] of Object.entries(v.backups)) {
      const nb = BAD_KEYS.has(k) ? null : normalizeBackup(b);
      if (nb) backups[k] = nb;
    }
  }
  const s = isObj(v.settings) ? v.settings : {};
  return { version: 1, profiles, backups, settings: { autoApply: s.autoApply === true, language: normalizeLanguage(s.language) } };
}

// ---- preset reading ----

export function describePreset(p: PresetLike): PresetDetail {
  const so = isObj(p.parameters?.samplerOverrides) ? (p.parameters.samplerOverrides as Record<string, unknown>) : {};
  const stored = isObj(p.metadata?.promptVariables) ? (p.metadata.promptVariables as Record<string, unknown>) : {};
  const variables: VariableInfo[] = [];
  for (const b of Array.isArray(p.prompt_order) ? p.prompt_order : []) {
    if (!isObj(b) || typeof b.id !== 'string' || !Array.isArray(b.variables)) continue;
    const bucket = isObj(stored[b.id]) ? (stored[b.id] as Record<string, unknown>) : {};
    for (const d of b.variables) {
      if (!isObj(d) || typeof d.name !== 'string') continue;
      const has = Object.hasOwn(bucket, d.name);
      variables.push({
        blockId: b.id,
        blockName: typeof b.name === 'string' ? b.name : b.id,
        blockEnabled: b.enabled !== false,
        name: d.name,
        label: typeof d.label === 'string' ? d.label : d.name,
        type: typeof d.type === 'string' ? d.type : 'text',
        options: Array.isArray(d.options)
          ? d.options.filter(isObj).map((o) => ({ id: String(o.id), label: String(o.label ?? o.id) }))
          : [],
        defaultValue: cleanJson(d.defaultValue) ?? null,
        current: has ? cleanJson(bucket[d.name]) : undefined,
        hasCurrent: has,
      });
    }
  }
  return {
    id: p.id,
    name: p.name,
    cacheRevision: p.cache_revision ?? 0,
    sampler: cleanSampler(so),
    variables,
  };
}

// ---- apply / undo ----

export type CommitResult =
  | { status: 'applied'; preset: PresetLike; skipped: string[] }
  | { status: 'noop'; skipped: string[]; preset: PresetLike }
  | { status: 'missing' }
  | { status: 'conflict' };

interface Plan {
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  skipped: string[];
  after?: (backup: { sampler: Record<string, Prev>; variables: Record<string, Record<string, Prev>> }) => void;
  sampler: Record<string, Prev>;
  variables: Record<string, Record<string, Prev>>;
}

/** Variables that exist on some block of the preset. Others would be dropped by the host. */
function definedVariables(p: PresetLike): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const b of Array.isArray(p.prompt_order) ? p.prompt_order : []) {
    if (!isObj(b) || typeof b.id !== 'string' || !Array.isArray(b.variables)) continue;
    m.set(b.id, new Set(b.variables.filter(isObj).map((d) => String(d.name))));
  }
  return m;
}

export function planApply(p: PresetLike, profile: Pick<Profile, 'sampler' | 'variables'>): Plan {
  const plan: Plan = { skipped: [], sampler: {}, variables: {} };

  if (Object.keys(profile.sampler).length) {
    const params = clone(p.parameters ?? {});
    const so = isObj(params.samplerOverrides) ? (params.samplerOverrides as Record<string, unknown>) : {};
    let changed = false;
    for (const [k, nv] of Object.entries(profile.sampler)) {
      const had = Object.hasOwn(so, k);
      if (had && deepEqual(so[k], nv)) continue;
      plan.sampler[k] = had ? { had, value: cleanJson(so[k]) ?? null } : { had };
      so[k] = nv;
      changed = true;
    }
    if (changed) {
      params.samplerOverrides = so;
      plan.parameters = params;
    }
  }

  if (Object.keys(profile.variables).length) {
    const defs = definedVariables(p);
    const meta = clone(p.metadata ?? {});
    const pv: Record<string, unknown> = isObj(meta.promptVariables) ? (meta.promptVariables as Record<string, unknown>) : {};
    let changed = false;
    for (const [bid, bucket] of Object.entries(profile.variables)) {
      for (const [name, nv] of Object.entries(bucket)) {
        if (!defs.get(bid)?.has(name)) {
          plan.skipped.push(`${bid}/${name}`);
          continue;
        }
        const cur: Record<string, unknown> = isObj(pv[bid]) ? (pv[bid] as Record<string, unknown>) : {};
        const had = Object.hasOwn(cur, name);
        if (had && deepEqual(cur[name], nv)) continue;
        (plan.variables[bid] ??= {})[name] = had ? { had, value: cleanJson(cur[name]) ?? null } : { had };
        cur[name] = nv;
        pv[bid] = cur;
        changed = true;
      }
    }
    if (changed) {
      meta.promptVariables = pv;
      plan.metadata = meta;
    }
  }
  return plan;
}

export function planUndo(p: PresetLike, backup: Backup): Plan {
  const plan: Plan = { skipped: [], sampler: {}, variables: {} };
  if (Object.keys(backup.sampler).length) {
    const params = clone(p.parameters ?? {});
    const so = isObj(params.samplerOverrides) ? (params.samplerOverrides as Record<string, unknown>) : {};
    for (const [k, prev] of Object.entries(backup.sampler)) {
      if (prev.had) so[k] = prev.value ?? null;
      else delete so[k];
    }
    params.samplerOverrides = so;
    if (!deepEqual(params, p.parameters ?? {})) plan.parameters = params;
  }
  if (Object.keys(backup.variables).length) {
    const meta = clone(p.metadata ?? {});
    const pv: Record<string, unknown> = isObj(meta.promptVariables) ? (meta.promptVariables as Record<string, unknown>) : {};
    const defs = definedVariables(p);
    for (const [bid, bucket] of Object.entries(backup.variables)) {
      const cur: Record<string, unknown> = isObj(pv[bid]) ? (pv[bid] as Record<string, unknown>) : {};
      for (const [name, prev] of Object.entries(bucket)) {
        if (prev.had) {
          if (defs.get(bid)?.has(name)) cur[name] = prev.value ?? null;
          else plan.skipped.push(`${bid}/${name}`);
        } else delete cur[name];
      }
      if (Object.keys(cur).length) pv[bid] = cur;
      else delete pv[bid];
    }
    meta.promptVariables = pv;
    if (!deepEqual(meta, p.metadata ?? {})) plan.metadata = meta;
  }
  return plan;
}

/**
 * When the profile carries sampler values but the preset's sampler switch is off, the host never sends
 * them with a generation request. Returns a warning text in that case, otherwise null.
 */
export function samplerDisabledWarning(preset: Pick<PresetLike, 'parameters'>, profile: Pick<Profile, 'sampler'>, language: Language = 'ko'): string | null {
  const t = translator(language);
  if (!Object.keys(profile.sampler).some((k) => k !== 'enabled')) return null;
  const so = preset.parameters?.samplerOverrides;
  if (isObj(so) && so.enabled === true) return null;
  return t('samplerDisabled');
}

/** An open editor holds its own draft and would silently write old values back over an apply or undo. */
export function editorBlocks(editorPresetId: string | null | undefined, presetId: string): boolean {
  return !!editorPresetId && editorPresetId === presetId;
}

/** How a write to `presetId` must be routed: straight to the host, through the open editor's draft, or not at all. */
export function writeRoute(info: { editorPresetId?: string | null; editorDraft?: boolean }, presetId: string, haveSession: boolean): 'direct' | 'editor' | 'refuse' {
  if (!editorBlocks(info.editorPresetId, presetId)) return 'direct';
  return info.editorDraft && haveSession ? 'editor' : 'refuse';
}

/**
 * Which preset is active. `hint` comes from the frontend's own state (undefined = it could not tell, null = none);
 * `api` is the answer of presets.getActive when the host has that call; `last` is the last hint seen.
 */
export function resolveActive(
  hint: string | null | undefined, api: { preset_id?: string | null; source?: string | null } | null, last?: string | null,
): { id: string | null; source: string | null; known: boolean } {
  let id: string | null | undefined = hint;
  if (id === undefined && api) id = api.preset_id ?? null;
  if (id === undefined) id = last;
  return { id: id ?? null, source: api?.source ?? null, known: id !== undefined };
}

/**
 * Read, plan, write with `expected_cache_revision`. On a revision conflict, re-read and plan again once.
 * `onPlan` receives the plan that was actually written.
 */
export async function commit(
  host: PresetHost,
  presetId: string,
  planner: (p: PresetLike) => Plan,
  onPlan?: (plan: Plan, written: PresetLike | null) => void,
): Promise<CommitResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const preset = await host.get(presetId);
    if (!preset) return { status: 'missing' };
    const plan = planner(preset);
    if (!plan.parameters && !plan.metadata) {
      onPlan?.(plan, null);
      return { status: 'noop', skipped: plan.skipped, preset };
    }
    const payload: UpdatePayload = { expected_cache_revision: preset.cache_revision ?? 0 };
    if (plan.parameters) payload.parameters = plan.parameters;
    if (plan.metadata) payload.metadata = plan.metadata;
    try {
      const written = await host.update(presetId, payload);
      onPlan?.(plan, written);
      return { status: 'applied', preset: written, skipped: plan.skipped };
    } catch (e) {
      if (isConflict(e) && attempt === 0) continue;
      if (isConflict(e)) return { status: 'conflict' };
      throw e;
    }
  }
  return { status: 'conflict' };
}

export async function applyProfile(
  host: PresetHost,
  store: Store,
  profile: Profile,
  conn: { before: string | null; switchedTo: string | null },
): Promise<CommitResult> {
  let plan: Plan | null = null;
  const result = await commit(host, profile.presetId, (p) => planApply(p, profile), (pl) => { plan = pl; });
  if (result.status === 'applied' && plan) {
    const pl = plan as Plan;
    store.backups[profile.presetId] = {
      presetId: profile.presetId,
      profileId: profile.id,
      profileName: profile.name,
      at: Date.now(),
      sampler: pl.sampler,
      variables: pl.variables,
      connectionBefore: conn.before,
      connectionSwitchedTo: conn.switchedTo,
    };
  }
  return result;
}

export async function undoBackup(host: PresetHost, store: Store, presetId: string): Promise<CommitResult> {
  const backup = store.backups[presetId];
  if (!backup) return { status: 'missing' };
  const result = await commit(host, presetId, (p) => planUndo(p, backup));
  if (result.status === 'applied' || result.status === 'noop') delete store.backups[presetId];
  return result;
}

// ---- apply / undo through an open preset editor ----

/** Pure sampler edit: returns the next samplerOverrides, the previous state of every key that changed, and whether anything changed. */
export function samplerPatch(
  current: unknown, patch: SamplerPatch,
): { next: Record<string, unknown>; prev: Record<string, Prev>; changed: boolean } {
  const next: Record<string, unknown> = isObj(current) ? { ...current } : {};
  const prev: Record<string, Prev> = {};
  let changed = false;
  for (const [k, nv] of Object.entries(patch.set)) {
    if (BAD_KEYS.has(k)) continue;
    const had = Object.hasOwn(next, k);
    if (had && deepEqual(next[k], nv)) continue;
    prev[k] = had ? { had, value: cleanJson(next[k]) ?? null } : { had };
    next[k] = nv;
    changed = true;
  }
  for (const k of patch.remove) {
    if (BAD_KEYS.has(k) || !Object.hasOwn(next, k)) continue;
    prev[k] = { had: true, value: cleanJson(next[k]) ?? null };
    delete next[k];
    changed = true;
  }
  return { next, prev, changed };
}

/** Runs a sampler patch through the open editor's draft and flushes it. Resolves after the host has persisted it. */
export type EditorSampler = (patch: SamplerPatch) => Promise<{ changed: boolean; prev: Record<string, Prev> }>;

/** Set when the editor path was not used and the write went straight to the host instead. `detected` = known beforehand, no editor call was made. */
export interface EditorFallback { reason: string; detected: boolean; reasonMessage?: LocalizedMessage }
export type EditorCommitResult = CommitResult & { fallback?: EditorFallback };

export const EDITOR_VAR_NOTE = translate('ko', 'editorVariablesNote');

/** Text for a write that went straight to the server because the editor path was not usable. */
export function fallbackMessage(f: EditorFallback, varsChanged: boolean): LocalizedMessage {
  const lead = f.detected || /^Invalid Loom/.test(f.reason)
    ? message('fallbackBlocks')
    : message('fallbackReason', { reason: f.reasonMessage ?? f.reason.slice(0, 120) });
  return message('fallbackNote', {
    lead, stale: message('fallbackStaleNote'),
    variables: varsChanged ? joinMessages(['\n', message('editorVariablesNote')]) : '',
  });
}

export function fallbackNote(f: EditorFallback, varsChanged: boolean, language: Language = 'ko'): string {
  return renderMessage(language, fallbackMessage(f, varsChanged));
}

const LOOM_REQUIRED_BLOCK_KEYS = ['id', 'name', 'content', 'role', 'enabled', 'position', 'depth', 'marker', 'isLocked', 'color', 'injectionTrigger', 'group'];

/**
 * Whether the host's editor (Loom value validator, same rules in Lumiverse 1.2.5 and 1.3.0) would refuse these blocks.
 * Only the cheap, certain conditions: a required key missing, a wrong-typed marker/color/group/injectionTrigger,
 * a category with a group, or a group that is not the category currently open. Returns the first problem or null.
 * The server accepts such blocks, so this only decides the route; it never changes a block.
 */
export function loomBlocksRejection(blocks: unknown): string | null {
  if (!Array.isArray(blocks)) return null;
  let category: string | null = null;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!isObj(b)) return `blocks[${i}]`;
    for (const k of LOOM_REQUIRED_BLOCK_KEYS) if (!Object.hasOwn(b, k)) return `blocks[${i}].${k}`;
    if (b.marker !== null && typeof b.marker !== 'string') return `blocks[${i}].marker`;
    if (b.color !== null && typeof b.color !== 'string') return `blocks[${i}].color`;
    if (!Array.isArray(b.injectionTrigger) || b.injectionTrigger.some((t) => typeof t !== 'string' || !t)) return `blocks[${i}].injectionTrigger`;
    if (b.group !== null && (typeof b.group !== 'string' || !b.group)) return `blocks[${i}].group`;
    if (b.marker === 'category') {
      if (b.group !== null) return `blocks[${i}].group`;
      category = typeof b.id === 'string' ? b.id : null;
    } else if (b.group !== null) {
      if (!category || category !== b.group) return `blocks[${i}].group`;
    } else category = null;
  }
  return null;
}

/**
 * Apply while the preset editor has the same preset open. Sampler values go through the editor draft
 * (so the editor and the stored preset agree and a later editor save cannot undo them); prompt-variable values
 * cannot be carried by the draft, so they are written through the host with a fresh revision right after.
 * If the editor refuses (`skipReason` known beforehand, or the call fails) the same change is written straight to the host.
 */
export async function applyProfileViaEditor(
  host: PresetHost, store: Store, profile: Profile, conn: { before: string | null; switchedTo: string | null }, editor: EditorSampler,
  skipReason?: string | null,
): Promise<EditorCommitResult> {
  let fallback: EditorFallback | undefined = skipReason ? { reason: skipReason, detected: true } : undefined;
  let ed: { changed: boolean; prev: Record<string, Prev> } = { changed: false, prev: {} };
  if (!fallback) {
    try { ed = await editor({ set: profile.sampler, remove: [] }); } catch (e) { fallback = { reason: e instanceof Error ? e.message : String(e), detected: false, ...(e instanceof LocalizedError ? { reasonMessage: e.localizedMessage } : {}) }; }
  }
  if (fallback) return { ...(await applyProfile(host, store, profile, conn)), fallback };
  let plan: Plan | null = null;
  const result = await commit(host, profile.presetId, (p) => planApply(p, { sampler: {}, variables: profile.variables }), (pl) => { plan = pl; });
  const varPlan = plan as Plan | null;
  if (ed.changed || result.status === 'applied') {
    store.backups[profile.presetId] = {
      presetId: profile.presetId, profileId: profile.id, profileName: profile.name, at: Date.now(),
      sampler: ed.prev, variables: varPlan?.variables ?? {},
      connectionBefore: conn.before, connectionSwitchedTo: conn.switchedTo,
    };
  }
  if (result.status === 'noop' && ed.changed) return { status: 'applied', preset: result.preset, skipped: result.skipped };
  return result;
}

export async function undoBackupViaEditor(
  host: PresetHost, store: Store, presetId: string, editor: EditorSampler, skipReason?: string | null,
): Promise<EditorCommitResult> {
  const backup = store.backups[presetId];
  if (!backup) return { status: 'missing' };
  const patch: SamplerPatch = { set: {}, remove: [] };
  for (const [k, prev] of Object.entries(backup.sampler)) {
    if (prev.had) patch.set[k] = prev.value ?? null;
    else patch.remove.push(k);
  }
  let fallback: EditorFallback | undefined = skipReason ? { reason: skipReason, detected: true } : undefined;
  let ed: { changed: boolean; prev: Record<string, Prev> } = { changed: false, prev: {} };
  if (!fallback) {
    try { ed = await editor(patch); } catch (e) { fallback = { reason: e instanceof Error ? e.message : String(e), detected: false, ...(e instanceof LocalizedError ? { reasonMessage: e.localizedMessage } : {}) }; }
  }
  if (fallback) return { ...(await undoBackup(host, store, presetId)), fallback };
  const result = await commit(host, presetId, (p) => planUndo(p, { ...backup, sampler: {} }));
  if (result.status === 'applied' || result.status === 'noop') delete store.backups[presetId];
  if (result.status === 'noop' && ed.changed) return { status: 'applied', preset: result.preset, skipped: result.skipped };
  return result;
}

// ---- save form: which values start checked ----

/** Sampler keys that differ from the host default (every numeric sampler defaults to unset = null). */
export function samplerPrechecked(detail: Pick<PresetDetail, 'sampler'>, key: string): boolean {
  if (BOOLEAN_SAMPLER_KEYS.includes(key) || !Object.hasOwn(detail.sampler, key)) return false;
  const v = detail.sampler[key];
  return v !== null && v !== undefined;
}

/** Prompt variables the user actually changed: an explicit stored value that differs from the block's default. */
export function variablePrechecked(info: Pick<VariableInfo, 'hasCurrent' | 'current' | 'defaultValue'>): boolean {
  return info.hasCurrent && !deepEqual(info.current, info.defaultValue);
}

// ---- export / import ----

export const EXPORT_FORMAT = 'setting-profiles';

export function exportProfiles(store: Store, ids?: string[]): string {
  const profiles = store.profiles.filter((p) => !ids || ids.includes(p.id));
  return JSON.stringify({ format: EXPORT_FORMAT, version: 1, profiles }, null, 2);
}

export function importProfiles(store: Store, text: string, now = Date.now(), language: Language = 'ko'): { added: number; errors: string[]; errorMessages: LocalizedMessage[] } {
  const result = (added: number, keys: MessageKey[]) => ({
    added, errors: keys.map((key) => translate(language, key)), errorMessages: keys.map((key) => message(key)),
  });
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return result(0, ['invalidJson']);
  }
  if (!isObj(raw) || raw.format !== EXPORT_FORMAT || !Array.isArray(raw.profiles)) {
    return result(0, ['invalidExport']);
  }
  let added = 0;
  const errors: MessageKey[] = [];
  for (const item of raw.profiles.slice(0, 200)) {
    const p = normalizeProfile({ ...(isObj(item) ? item : {}), id: undefined, createdAt: now, updatedAt: now }, now);
    if (!p) {
      errors.push('importSkipped');
      continue;
    }
    p.name = uniqueName(store, p.presetId, p.name);
    store.profiles.push(p);
    added++;
  }
  return result(added, errors);
}

export function uniqueName(store: Store, presetId: string, name: string, exceptId?: string): string {
  const taken = new Set(store.profiles.filter((p) => p.presetId === presetId && p.id !== exceptId).map((p) => p.name));
  if (!taken.has(name)) return name;
  for (let i = 2; i < 1000; i++) if (!taken.has(`${name} (${i})`)) return `${name} (${i})`;
  return `${name} (${newId('d')})`;
}
