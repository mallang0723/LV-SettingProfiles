// Types and small helpers shared by the backend worker and the browser frontend.

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export const SAMPLER_KEYS = [
  'enabled', 'maxTokens', 'contextSize', 'temperature', 'topP', 'minP', 'topK',
  'frequencyPenalty', 'presencePenalty', 'repetitionPenalty', 'streaming',
] as const;
export type SamplerKey = (typeof SAMPLER_KEYS)[number];
export const BOOLEAN_SAMPLER_KEYS: readonly string[] = ['enabled', 'streaming'];

export const SAMPLER_LABELS: Record<SamplerKey, string> = {
  enabled: '샘플러 값 사용',
  maxTokens: '최대 토큰 (maxTokens)',
  contextSize: '컨텍스트 크기',
  temperature: '온도 (temperature)',
  topP: 'Top P',
  minP: 'Min P',
  topK: 'Top K',
  frequencyPenalty: 'Frequency 페널티',
  presencePenalty: 'Presence 페널티',
  repetitionPenalty: 'Repetition 페널티',
  streaming: '스트리밍',
};

/** variables[blockId][name] = value. */
export type VariableValues = Record<string, Record<string, Json>>;

export interface Profile {
  id: string;
  name: string;
  presetId: string;
  presetName: string;
  /** Only keys that are present are applied. `null` clears the value ("비움"). */
  sampler: Record<string, Json>;
  variables: VariableValues;
  /** Optional: connection to switch to when the profile is applied by hand. */
  connectionId: string | null;
  /** Connections whose selection auto-applies this profile (when auto-apply is on). */
  autoConnectionIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Prev {
  had: boolean;
  value?: Json;
}

export interface Backup {
  presetId: string;
  profileId: string;
  profileName: string;
  at: number;
  sampler: Record<string, Prev>;
  variables: Record<string, Record<string, Prev>>;
  /** Connection before and after, when the apply switched connections. */
  connectionBefore: string | null;
  connectionSwitchedTo: string | null;
}

export interface Settings {
  autoApply: boolean;
}

export interface Store {
  version: 1;
  profiles: Profile[];
  /** At most one backup per preset: the values just before the latest apply. */
  backups: Record<string, Backup>;
  settings: Settings;
}

export interface VariableInfo {
  blockId: string;
  blockName: string;
  blockEnabled: boolean;
  name: string;
  label: string;
  type: string;
  options: Array<{ id: string; label: string }>;
  defaultValue: Json;
  /** Explicit override stored on the preset, if any. */
  current: Json | undefined;
  hasCurrent: boolean;
}

export interface PresetDetail {
  id: string;
  name: string;
  cacheRevision: number;
  sampler: Record<string, Json>;
  variables: VariableInfo[];
}

export interface StateMsg {
  type: 'state';
  profiles: Profile[];
  backups: Record<string, Backup>;
  settings: Settings;
  presets: Array<{ id: string; name: string }>;
  activePresetId: string | null;
  activeSource: string | null;
  /** False when the host offers no way to tell which preset is active (auto-apply cannot work). */
  activeAvailable: boolean;
}

/** What the frontend knows about the open preset editor. `draft` = the editor can take writes (updatePreset + flush). */
export interface EditorInfo {
  editorPresetId?: string | null;
  editorDraft?: boolean;
}

/** Sampler change to run through the open editor's draft: set these keys, delete those. */
export interface SamplerPatch {
  set: Record<string, Json>;
  remove: string[];
}

export type ToBackend =
  | { type: 'load'; chatId: string | null; activePresetId?: string | null }
  | { type: 'detail'; presetId: string }
  | { type: 'save_profile'; profile: Partial<Profile> & { name: string; presetId: string } }
  | { type: 'delete'; id: string }
  | ({ type: 'apply'; id: string; chatId: string | null; activeConnectionId: string | null; switched: boolean } & EditorInfo)
  | ({ type: 'undo'; presetId: string } & EditorInfo)
  | ({ type: 'connection_changed'; connectionId: string | null; chatId: string | null; activePresetId?: string | null } & EditorInfo)
  | { type: 'editor_reply'; reqId: string; ok: boolean; error?: string; changed?: boolean; prev?: Record<string, Prev> }
  | { type: 'export'; ids?: string[] }
  | { type: 'import'; text: string }
  | { type: 'set_settings'; settings: Partial<Settings> }
  | { type: 'notify'; kind: 'info' | 'warning' | 'error'; text: string };

export type ToFrontend =
  | StateMsg
  | { type: 'detail'; detail: PresetDetail | null; presetId: string }
  | { type: 'result'; level: 'info' | 'warning' | 'error'; text: string; switchConnection?: string | null; presetId?: string }
  | { type: 'export'; text: string; filename: string }
  | ({ type: 'editor_patch'; reqId: string; presetId: string } & SamplerPatch);

let counter = 0;
/** Id generator that works in non-secure (http) contexts: no crypto.randomUUID. */
export function newId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyStore(): Store {
  return { version: 1, profiles: [], backups: {}, settings: { autoApply: false } };
}
