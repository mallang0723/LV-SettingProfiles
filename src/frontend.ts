// Frontend: a drawer tab to save, edit, apply and undo setting profiles.
// Mobile first (360px). No secure-context-only APIs (no crypto.randomUUID, no clipboard API).

import { operationError } from './diagnostics';
import { normalizeLanguage, resolveLanguage, translate, message, renderMessage, LocalizedError, errorMessage, type LocalizedMessage, type Language, type LanguageSetting, type MessageKey, type Params } from './i18n';
import { watchHostLanguage } from './language-events';
import type { SpindleFrontendContext } from 'lumiverse-spindle-types';
import { loomBlocksRejection, samplerPatch, samplerPrechecked, variablePrechecked } from './core';
import {
  BOOLEAN_SAMPLER_KEYS, SAMPLER_KEYS, SAMPLER_LABEL_KEYS,
  type EditorInfo, type Json, type PresetDetail, type Prev, type Profile, type SamplerPatch, type StateMsg, type ToBackend, type ToFrontend, type VariableInfo,
} from './shared';

const CSS = `
.sp-panel { display: flex; flex-direction: column; gap: 12px; padding: 10px; color: var(--lumiverse-text, inherit); box-sizing: border-box; max-width: 100%; }
.sp-panel * { box-sizing: border-box; }
.sp-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.sp-muted { opacity: 0.8; font-size: 0.85em; }
.sp-h { font-weight: 600; margin: 2px 0; }
.sp-card { border: 1px solid var(--lumiverse-border, rgba(127,127,127,0.3)); border-radius: var(--lumiverse-radius, 8px); padding: 8px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.sp-title { font-weight: 600; overflow-wrap: anywhere; }
.sp-btn { font: inherit; font-size: 0.9em; cursor: pointer; min-height: 34px; padding: 4px 10px; border-radius: var(--lumiverse-radius-sm, 6px); color: inherit;
  background: var(--lumiverse-fill-subtle, rgba(127,127,127,0.12)); border: 1px solid var(--lumiverse-border, rgba(127,127,127,0.3)); }
.sp-btn:hover:not(:disabled) { border-color: var(--lumiverse-primary, currentColor); }
.sp-btn:disabled { opacity: 0.5; cursor: default; }
.sp-btn.sp-primary { background: var(--lumiverse-primary-015, rgba(100,140,255,0.15)); border-color: var(--lumiverse-primary, currentColor); }
.sp-btn.sp-danger { color: var(--lumiverse-danger, #d55); border-color: var(--lumiverse-danger, #d55); }
.sp-panel input[type=text], .sp-panel input[type=number], .sp-panel textarea, .sp-panel select {
  font: inherit; color: inherit; min-width: 0; width: 100%; padding: 5px 7px; border-radius: 4px;
  background: var(--lumiverse-fill-subtle, rgba(127,127,127,0.08)); border: 1px solid var(--lumiverse-border, rgba(127,127,127,0.3)); }
.sp-panel textarea { min-height: 60px; resize: vertical; }
.sp-field { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.sp-check { display: flex; align-items: center; gap: 6px; min-height: 28px; }
.sp-check input { flex: 0 0 auto; width: 18px; height: 18px; }
.sp-line { display: grid; grid-template-columns: 1fr; gap: 3px; padding: 6px 0; border-top: 1px solid var(--lumiverse-border, rgba(127,127,127,0.2)); }
.sp-status { white-space: pre-wrap; font-size: 0.88em; overflow-wrap: anywhere; }
.sp-status.sp-error { color: var(--lumiverse-danger, #d55); }
.sp-status.sp-warning { color: var(--lumiverse-warning, #c80); }
`;

type Children = Array<Node | string | null | false | undefined>;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<Record<string, unknown>> = {}, children: Children = []): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = String(v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k in node) (node as unknown as Record<string, unknown>)[k] = v;
    else node.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

const btn = (label: string, onClick: () => void, cls = '', disabled = false) =>
  el('button', { type: 'button', class: `sp-btn ${cls}`.trim(), onClick, disabled }, [label]);

const ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';

interface ConnItem { id: string; name: string; model: string }
interface VarRow { info: VariableInfo; on: boolean; text: string }
interface Form {
  id: string | null;
  name: string;
  presetId: string;
  presetName: string;
  sampler: Record<string, { on: boolean; text: string }>;
  vars: VarRow[];
  orphans: Record<string, Record<string, Json>>;
  connectionId: string;
  auto: Set<string>;
}

export const valueToText = (v: Json | undefined): string =>
  v === undefined || v === null ? '' : typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : JSON.stringify(v);

export function parseVariable(type: string, text: string, language: Language = 'ko'): Json {
  const t = message;
  if (type === 'number' || type === 'slider') {
    const n = Number(text);
    if (text.trim() === '' || !Number.isFinite(n)) throw new LocalizedError(t('notNumber'), language);
    return n;
  }
  if (type === 'switch') return text === '1' || text === 'true' ? 1 : 0;
  if (type === 'select' || type === 'text' || type === 'textarea') return text;
  try { return JSON.parse(text) as Json; } catch { throw new LocalizedError(t('invalidVariableJson'), language); }
}

/** Shape check for the JSON-typed variables, so a typo does not store a value the host would reject or ignore. */
export function checkVariableShape(type: string, options: Array<{ id: string }>, v: Json, language: Language = 'ko'): void {
  const t = message;
  if (type === 'range') {
    if (!Array.isArray(v) || v.length !== 2 || v.some((x) => typeof x !== 'number' || !Number.isFinite(x))) throw new LocalizedError(t('rangeShape'), language);
    if ((v[0] as number) > (v[1] as number)) throw new LocalizedError(t('rangeOrder'), language);
  } else if (type === 'multiselect') {
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new LocalizedError(t('multiselectShape'), language);
    const ids = new Set(options.map((o) => o.id));
    const bad = (v as string[]).filter((x) => !ids.has(x));
    if (ids.size && bad.length) throw new LocalizedError(t('missingOptions', { options: bad.join(', ') }), language);
  }
}

export function parseSampler(key: string, text: string, language: Language = 'ko'): Json {
  const t = message;
  if (BOOLEAN_SAMPLER_KEYS.includes(key)) return text === 'true';
  if (text.trim() === '') return null;
  const n = Number(text);
  if (!Number.isFinite(n)) throw new LocalizedError(t('notNumber'), language);
  return n;
}

export function setup(ctx: SpindleFrontendContext) {
  let languageSetting: LanguageSetting = 'auto';
  let pendingLanguage: LanguageSetting | null = null;
  let language = resolveLanguage(languageSetting);
  const t = (key: MessageKey, params?: Params) => translate(language, key, params);
  let st: StateMsg | null = null;
  let selected: string | null = null;
  let detail: PresetDetail | null = null;
  let form: Form | null = null;
  let status: LocalizedMessage | null = null;
  let statusLevel: 'info' | 'warning' | 'error' = 'info';
  let conns: ConnItem[] = [];
  let suppressUntil = 0;
  let debounce: ReturnType<typeof setTimeout> | null = null;
  const toBackend = (m: ToBackend) => ctx.sendToBackend({ ...m, language });
  const removeStyle = ctx.dom.addStyle(CSS);

  const chatId = (): string | null => {
    const m = /^\/chat\/([^/?#]+)/.exec(location.pathname);
    return m ? decodeURIComponent(m[1]!) : null;
  };

  // ---- connections (some of these members are missing from older type packages) ----
  type ConnApi = {
    list?: () => unknown; getActive?: () => { activeProfileId: string | null };
    subscribe?: (h: (v: { activeProfileId: string | null }) => void) => () => void;
    setActive?: (id: string | null) => void; setActiveAcknowledged?: (id: string | null) => unknown;
  };
  const connApi = (): ConnApi | undefined => (ctx as unknown as { connections?: ConnApi }).connections;
  // `generation` gates connection switching and change notifications. null = could not tell (treated as granted).
  let granted: string[] | null = null;
  const genDenied = () => granted !== null && !granted.includes('generation');
  async function loadGranted(): Promise<void> {
    try {
      const g = await (ctx as unknown as { permissions?: { getGranted?: () => Promise<string[]> } }).permissions?.getGranted?.();
      granted = Array.isArray(g) ? g : null;
    } catch { granted = null; }
    render();
  }
  const canAuto = () => !genDenied() && typeof connApi()?.subscribe === 'function' && typeof connApi()?.getActive === 'function' && activeKnown();
  const canSwitch = () => !genDenied() && (typeof connApi()?.setActiveAcknowledged === 'function' || typeof connApi()?.setActive === 'function');
  const activeConn = (): string | null => {
    try { return connApi()?.getActive?.().activeProfileId ?? null; } catch { return null; }
  };
  async function loadConns(): Promise<void> {
    try {
      const r = await Promise.resolve(connApi()?.list?.());
      conns = Array.isArray(r) ? (r as ConnItem[]).map((c) => ({ id: String(c.id), name: String(c.name ?? c.id), model: String(c.model ?? '') })) : [];
    } catch { conns = []; }
  }
  async function switchConn(id: string | null | undefined): Promise<void> {
    if (!id) return;
    const api = connApi();
    suppressUntil = Date.now() + 2500;
    try {
      if (typeof api?.setActiveAcknowledged === 'function') await api.setActiveAcknowledged(id);
      else api?.setActive?.(id);
    } catch (e) {
      console.warn(operationError('connection_switch', e));
      show('error', message('switchFailed', { error: message('unexpectedError') }));
    }
  }

  let offSub: (() => void) | null = null;
  let lastConn: string | null = activeConn();
  if (typeof connApi()?.subscribe === 'function' && typeof connApi()?.getActive === 'function') {
    offSub = connApi()!.subscribe!((v) => {
      const id = v?.activeProfileId ?? null;
      if (id === lastConn) return;
      lastConn = id;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (Date.now() < suppressUntil || !st?.settings.autoApply) return;
        if (genDenied()) return;
        toBackend({ type: 'connection_changed', connectionId: id, chatId: chatId(), activePresetId: activeHint(), ...editorInfo() });
      }, 700);
    });
  }

  // ---- active preset ----
  // Some hosts (1.2.5) give the worker no way to ask which preset is active, so read it from the page state.
  // undefined = the host offers no such selector.
  type StateApi = { get?: (id: string) => unknown; subscribe?: (id: string, h: (v: unknown) => void) => () => void };
  const stateApi = (): StateApi | undefined => (ctx as unknown as { state?: StateApi }).state;
  function activeHint(): string | null | undefined {
    try {
      const sa = stateApi();
      if (typeof sa?.get !== 'function') return undefined;
      const v = sa.get('loom.activePresetId');
      return typeof v === 'string' && v ? v : null;
    } catch { return undefined; }
  }
  const activeKnown = (): boolean => activeHint() !== undefined || !!st?.activeAvailable;
  const currentActive = (): string | null => { const h = activeHint(); return h !== undefined ? h : (st?.activePresetId ?? null); };
  let offActive: (() => void) | null = null;
  try {
    const sa = stateApi();
    if (typeof sa?.subscribe === 'function') offActive = sa.subscribe('loom.activePresetId', () => render());
  } catch { offActive = null; }

  // ---- preset editor ----
  // An open editor keeps its own draft and writes whole fields back on its next save. So while the editor has the
  // preset open, sampler values go through the editor draft itself (updatePreset + flush) and the stored preset follows.
  type EditorApi = {
    getState(): { open: boolean; presetId: string | null; preset: { parameters: Record<string, unknown> } | null };
    updatePreset?: (m: (d: { parameters: Record<string, unknown> }) => unknown, o?: { immediate?: boolean }) => void;
    flush?: () => Promise<void>;
  };
  const editorApi = (): EditorApi | undefined => (ctx.ui as unknown as { presetEditor?: EditorApi }).presetEditor;
  function editorPresetId(): string | null {
    try {
      const s = editorApi()?.getState();
      return s?.open && s.presetId ? s.presetId : null;
    } catch { return null; }
  }
  function editorInfo(): EditorInfo {
    const pe = editorApi();
    let editorBlocksReject: string | null = null;
    try { const st = pe?.getState(); if (st?.open && st.preset) editorBlocksReject = loomBlocksRejection((st.preset as { blocks?: unknown }).blocks); } catch { editorBlocksReject = null; }
    return { editorPresetId: editorPresetId(), editorDraft: typeof pe?.updatePreset === 'function' && typeof pe?.flush === 'function', editorBlocksReject };
  }
  async function runEditorPatch(presetId: string, patch: SamplerPatch): Promise<{ changed: boolean; prev: Record<string, Prev> }> {
    const pe = editorApi();
    const s = pe?.getState();
    if (!pe?.updatePreset || !pe.flush || !s?.open || s.presetId !== presetId || !s.preset) throw new LocalizedError(message('editorClosed'), language);
    let out: { changed: boolean; prev: Record<string, Prev> } | null = null;
    pe.updatePreset((d) => {
      const r = samplerPatch(d.parameters?.samplerOverrides, patch);
      out = { changed: r.changed, prev: r.prev };
      if (!r.changed) return d;
      return { ...d, parameters: { ...d.parameters, samplerOverrides: r.next } };
    }, { immediate: true });
    if (!out) throw new LocalizedError(message('editorRejected'), language);
    await pe.flush();
    return out;
  }

  function show(level: 'info' | 'warning' | 'error', text: LocalizedMessage): void {
    status = text; statusLevel = level; render();
  }

  // ---- panel ----
  const tab = ctx.ui.registerDrawerTab({
    id: 'setting-profiles', title: t('title'), shortName: t('shortName'),
    // Description/keywords have no update API; bilingual metadata remains searchable in either language.
    // Omit headerTitle so the host header follows setTitle.
    description: `${translate('ko', 'description')} / ${translate('en', 'description')}`,
    keywords: (['ko', 'en'] as const).flatMap((lang) => (['profileKeyword', 'profiles', 'sampler', 'variables', 'perModel'] as const).map((key) => translate(lang, key))),
    iconSvg: ICON,
  });
  const panel = el('div', { class: 'sp-panel' });
  tab.root.replaceChildren(panel);

  const inputAction = ctx.ui.registerInputBarAction?.({
    id: 'setting-profiles', label: t('title'), subtitle: t('description'), iconSvg: ICON,
  });
  const offInputClick = inputAction?.onClick(() => tab.activate());

  function updateLanguage(): void {
    const next = resolveLanguage(languageSetting);
    if (next === language) return;
    language = next;
    tab.setTitle(t('title'));
    tab.setShortName(t('shortName'));
    inputAction?.setLabel(t('title'));
    inputAction?.setSubtitle(t('description'));
    render();
  }

  function reload(): void {
    toBackend({ type: 'load', chatId: chatId(), activePresetId: activeHint() });
    void loadConns();
    void loadGranted();
  }
  const offActivate = tab.onActivate(reload);

  function pickPreset(id: string): void {
    selected = id; detail = null; form = null;
    toBackend({ type: 'detail', presetId: id });
    render();
  }

  function summary(p: Profile): string {
    const parts: string[] = [];
    const sc = Object.keys(p.sampler).length; if (sc) parts.push(t('samplerCount', { count: sc }));
    const vc = Object.values(p.variables).reduce((n, b) => n + Object.keys(b).length, 0); if (vc) parts.push(t('variableCount', { count: vc }));
    if (p.connectionId) parts.push(t('connectionSummary', { name: conns.find((c) => c.id === p.connectionId)?.name ?? t('unknown') }));
    if (p.autoConnectionIds.length) parts.push(t('autoCount', { count: p.autoConnectionIds.length }));
    return parts.join(' · ') || t('empty');
  }

  function doApply(p: Profile): void {
    toBackend({ type: 'apply', id: p.id, chatId: chatId(), activeConnectionId: activeConn(), switched: !!p.connectionId && canSwitch(), ...editorInfo() });
  }

  function newForm(profile: Profile | null): Form | null {
    if (!detail || !selected) return null;
    const sampler: Form['sampler'] = {};
    for (const k of SAMPLER_KEYS) {
      const inProfile = profile ? Object.hasOwn(profile.sampler, k) : false;
      const cur = detail.sampler[k];
      const val = profile ? (inProfile ? profile.sampler[k] : cur) : cur;
      sampler[k] = { on: profile ? inProfile : samplerPrechecked(detail, k), text: BOOLEAN_SAMPLER_KEYS.includes(k) ? String(val !== false) : valueToText(val) };
    }
    const known = new Set(detail.variables.map((v) => `${v.blockId}\u0000${v.name}`));
    const vars: VarRow[] = detail.variables.map((info) => {
      const pv = profile?.variables[info.blockId]?.[info.name];
      const inProfile = pv !== undefined;
      const base = info.hasCurrent ? info.current : info.defaultValue;
      return { info, on: profile ? inProfile : variablePrechecked(info), text: valueToText(inProfile ? pv : base) };
    });
    const orphans: Form['orphans'] = {};
    for (const [b, bucket] of Object.entries(profile?.variables ?? {})) {
      for (const [n, v] of Object.entries(bucket)) if (!known.has(`${b}\u0000${n}`)) (orphans[b] ??= {})[n] = v;
    }
    return {
      id: profile?.id ?? null, name: profile?.name ?? '', presetId: selected, presetName: detail.name,
      sampler, vars, orphans, connectionId: profile?.connectionId ?? '', auto: new Set(profile?.autoConnectionIds ?? []),
    };
  }

  function saveForm(): void {
    const f = form; if (!f) return;
    if (!f.name.trim()) { show('error', message('nameRequired')); return; }
    try {
      const sampler: Record<string, Json> = {};
      for (const k of SAMPLER_KEYS) {
        const r = f.sampler[k]!;
        if (r.on) { try { sampler[k] = parseSampler(k, r.text, language); } catch (e) { throw new LocalizedError(message('fieldError', { label: message(SAMPLER_LABEL_KEYS[k]), error: errorMessage(e) }), language); } }
      }
      const variables: Record<string, Record<string, Json>> = {};
      for (const [b, bucket] of Object.entries(f.orphans)) variables[b] = { ...bucket };
      for (const r of f.vars) {
        if (!r.on) continue;
        let v: Json;
        try { v = parseVariable(r.info.type, r.text, language); checkVariableShape(r.info.type, r.info.options, v, language); } catch (e) { throw new LocalizedError(message('fieldError', { label: r.info.label, error: errorMessage(e) }), language); }
        (variables[r.info.blockId] ??= {})[r.info.name] = v;
      }
      const auto = [...f.auto].filter((id) => id === f.connectionId || conns.some((c) => c.id === id));
      toBackend({
        type: 'save_profile',
        profile: {
          id: f.id ?? undefined, name: f.name.trim(), presetId: f.presetId, presetName: f.presetName, sampler, variables,
          connectionId: f.connectionId || null, autoConnectionIds: auto,
        },
      });
      form = null;
      status = null;
      render();
    } catch (e) {
      show('error', errorMessage(e));
    }
  }

  function renderForm(f: Form): HTMLElement {
    const box = el('div', { class: 'sp-card' });
    box.append(el('div', { class: 'sp-title' }, [f.id ? t('editProfile') : t('newProfile')]));
    box.append(el('div', { class: 'sp-field' }, [
      el('label', {}, [t('name')]),
      el('input', { type: 'text', value: f.name, maxLength: 80, placeholder: t('namePlaceholder'), onInput: (e: Event) => { f.name = (e.target as HTMLInputElement).value; } }),
    ]));
    box.append(el('div', { class: 'sp-muted' }, [t('fieldsHint')]));

    box.append(el('div', { class: 'sp-h' }, [t('sampler')]));
    if (detail && detail.sampler.enabled !== true) {
      box.append(el('div', { class: 'sp-status sp-warning' }, [t('samplerFormWarning')]));
    }
    for (const k of SAMPLER_KEYS) {
      const r = f.sampler[k]!;
      const input = BOOLEAN_SAMPLER_KEYS.includes(k)
        ? el('select', { onChange: (e: Event) => { r.text = (e.target as HTMLSelectElement).value; } }, [
            el('option', { value: 'true', selected: r.text === 'true' }, [t('on')]), el('option', { value: 'false', selected: r.text !== 'true' }, [t('off')])])
        : el('input', { type: 'text', inputMode: 'decimal', value: r.text, placeholder: t('clear'), onInput: (e: Event) => { r.text = (e.target as HTMLInputElement).value; } });
      box.append(el('div', { class: 'sp-line' }, [
        el('label', { class: 'sp-check' }, [el('input', { type: 'checkbox', checked: r.on, onChange: (e: Event) => { r.on = (e.target as HTMLInputElement).checked; } }), t(SAMPLER_LABEL_KEYS[k])]),
        input,
      ]));
    }

    box.append(el('div', { class: 'sp-h' }, [t('variables')]));
    if (!f.vars.length) box.append(el('div', { class: 'sp-muted' }, [t('noVariables')]));
    const varRows: Array<{ node: HTMLElement; text: string; row: VarRow }> = [];
    if (f.vars.length > 8) {
      box.append(el('div', { class: 'sp-field' }, [
        el('input', { type: 'text', placeholder: t('searchVariables', { count: f.vars.length }), onInput: (e: Event) => {
          const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
          for (const v of varRows) v.node.style.display = !q || v.row.on || v.text.includes(q) ? '' : 'none';
        } }),
      ]));
    }
    for (const r of f.vars) {
      const variableType = r.info.type;
      let input: HTMLElement;
      if (variableType === 'select') {
        const opts = r.info.options.slice();
        if (!opts.some((o) => o.id === r.text)) opts.unshift({ id: r.text, label: r.text || t('emptyValue') });
        input = el('select', { onChange: (e: Event) => { r.text = (e.target as HTMLSelectElement).value; } }, opts.map((o) => el('option', { value: o.id, selected: o.id === r.text }, [o.label])));
      } else if (variableType === 'switch') {
        input = el('select', { onChange: (e: Event) => { r.text = (e.target as HTMLSelectElement).value; } }, [
          el('option', { value: '1', selected: r.text === '1' }, [t('on')]), el('option', { value: '0', selected: r.text !== '1' }, [t('off')])]);
      } else if (variableType === 'textarea') {
        input = el('textarea', { value: r.text, onInput: (e: Event) => { r.text = (e.target as HTMLTextAreaElement).value; } });
      } else {
        input = el('input', { type: 'text', value: r.text, onInput: (e: Event) => { r.text = (e.target as HTMLInputElement).value; } });
      }
      const line = el('div', { class: 'sp-line' }, [
        el('label', { class: 'sp-check' }, [el('input', { type: 'checkbox', checked: r.on, onChange: (e: Event) => { r.on = (e.target as HTMLInputElement).checked; } }), `${r.info.blockName} / ${r.info.label}`]),
        input,
        (variableType === 'multiselect' || variableType === 'range') ? el('div', { class: 'sp-muted' }, [t('jsonHint')]) : null,
        r.info.blockEnabled ? null : el('div', { class: 'sp-muted' }, [t('blockDisabled')]),
      ]);
      varRows.push({ node: line, row: r, text: `${r.info.blockName} ${r.info.label} ${r.info.name}`.toLowerCase() });
      box.append(line);
    }
    const orphanCount = Object.values(f.orphans).reduce((n, b) => n + Object.keys(b).length, 0);
    if (orphanCount) box.append(el('div', { class: 'sp-muted' }, [t('orphanVariables', { count: orphanCount })]));

    box.append(el('div', { class: 'sp-h' }, [t('optionalConnection')]));
    if (!canSwitch()) box.append(el('div', { class: 'sp-muted' }, [genDenied() ? t('switchPermission') : t('switchUnsupported')]));
    const connSel = el('select', { disabled: !canSwitch(), onChange: (e: Event) => { f.connectionId = (e.target as HTMLSelectElement).value; } },
      [el('option', { value: '', selected: !f.connectionId }, [t('keepConnection')]), ...conns.map((c) => el('option', { value: c.id, selected: c.id === f.connectionId }, [c.model ? `${c.name} (${c.model})` : c.name]))]);
    box.append(el('div', { class: 'sp-field' }, [el('label', {}, [t('switchOnApply')]), connSel]));
    box.append(el('div', { class: 'sp-muted' }, [t('reasoningHint')]));
    if (canAuto()) {
      box.append(el('div', { class: 'sp-field' }, [el('div', {}, [t('autoConnections')])]));
      for (const c of conns) {
        box.append(el('label', { class: 'sp-check' }, [
          el('input', { type: 'checkbox', checked: f.auto.has(c.id), onChange: (e: Event) => { if ((e.target as HTMLInputElement).checked) f.auto.add(c.id); else f.auto.delete(c.id); } }),
          c.name,
        ]));
      }
    }
    box.append(el('div', { class: 'sp-row' }, [btn(t('save'), saveForm, 'sp-primary'), btn(t('cancel'), () => { form = null; render(); })]));
    return box;
  }

  function render(): void {
    panel.lang = language;
    const languageSelect = el('select', { id: 'sp-language', value: languageSetting, onChange: (e: Event) => {
      languageSetting = normalizeLanguage((e.target as HTMLSelectElement).value);
      pendingLanguage = languageSetting;
      updateLanguage();
      toBackend({ type: 'set_settings', settings: { language: languageSetting } });
    } }, (['auto', 'ko', 'en'] as const).map((value) => el('option', { value, selected: value === languageSetting }, [
      t(value === 'auto' ? 'languageAuto' : value === 'ko' ? 'languageKo' : 'languageEn'),
    ])));
    const languageField = el('div', { class: 'sp-field' }, [el('label', { htmlFor: 'sp-language' }, [t('language')]), languageSelect]);
    const kids: Children = [languageField];
    if (!st) {
      panel.replaceChildren(languageField, el('div', { class: 'sp-muted' }, [t('loading')]));
      return;
    }
    // Target preset
    const sel = el('select', { onChange: (e: Event) => pickPreset((e.target as HTMLSelectElement).value) },
      st.presets.map((p) => el('option', { value: p.id, selected: p.id === selected }, [p.id === currentActive() ? t('currentPreset', { name: p.name }) : p.name])));
    kids.push(el('div', { class: 'sp-field' }, [el('label', { class: 'sp-h' }, [t('targetPreset')]), sel]));
    kids.push(el('div', { class: 'sp-muted' }, [t('scopeHint')]));

    if (status) kids.push(el('div', { class: `sp-status sp-${statusLevel}` }, [renderMessage(language, status)]));

    const mine = st.profiles.filter((p) => p.presetId === selected);
    const backup = selected ? st.backups[selected] : undefined;
    kids.push(el('div', { class: 'sp-row' }, [
      btn(t('saveCurrent'), () => { form = newForm(null); render(); }, 'sp-primary', !detail),
      backup ? btn(t('undoLabel', { name: backup.profileName }), () => toBackend({ type: 'undo', presetId: selected!, ...editorInfo() })) : null,
    ]));
    if (form) kids.push(renderForm(form));

    kids.push(el('div', { class: 'sp-h' }, [t('profileCount', { count: mine.length })]));
    if (!mine.length) kids.push(el('div', { class: 'sp-muted' }, [t('noProfiles')]));
    for (const p of mine) {
      kids.push(el('div', { class: 'sp-card' }, [
        el('div', { class: 'sp-title' }, [p.name]),
        el('div', { class: 'sp-muted' }, [summary(p)]),
        el('div', { class: 'sp-row' }, [
          btn(t('apply'), () => void doApply(p), 'sp-primary'),
          btn(t('edit'), () => { form = newForm(p); render(); }, '', !detail),
          btn(t('delete'), () => { if (confirm(t('deleteConfirm', { name: p.name }))) toBackend({ type: 'delete', id: p.id }); }, 'sp-danger'),
        ]),
      ]));
    }
    const others = st.profiles.length - mine.length;
    if (others) kids.push(el('div', { class: 'sp-muted' }, [t('otherProfiles', { count: others })]));

    kids.push(el('div', { class: 'sp-h' }, [t('options')]));
    kids.push(el('label', { class: 'sp-check' }, [
      el('input', { type: 'checkbox', checked: st.settings.autoApply && canAuto(), disabled: !canAuto(), onChange: (e: Event) => toBackend({ type: 'set_settings', settings: { autoApply: (e.target as HTMLInputElement).checked } }) }),
      t('autoApply'),
    ]));
    if (!canAuto()) {
      kids.push(el('div', { class: 'sp-status sp-warning' }, [
        genDenied() ? t('autoPermission')
          : typeof connApi()?.subscribe !== 'function' || typeof connApi()?.getActive !== 'function' ? t('autoUnsupported')
          : t('activeUnknown'),
      ]));
    }
    const file = el('input', { type: 'file', accept: '.json,application/json', style: 'display:none', onChange: (e: Event) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) { show('error', message('fileTooLarge')); return; }
      void f.text().then((text) => toBackend({ type: 'import', text })).catch(() => show('error', message('unexpectedError')));
    } });
    kids.push(el('div', { class: 'sp-row' }, [
      btn(t('export'), () => toBackend({ type: 'export' })),
      btn(t('import'), () => file.click()),
      file,
      btn(t('refresh'), reload),
    ]));
    panel.replaceChildren(...(kids.filter(Boolean) as Node[]));
  }

  // ---- backend messages ----
  const offBackend = ctx.onBackendMessage((raw) => {
    const msg = raw as ToFrontend;
    switch (msg?.type) {
      case 'state': {
        st = msg;
        const storedLanguage = normalizeLanguage(msg.settings.language);
        if (storedLanguage === pendingLanguage) pendingLanguage = null;
        // An older load/save reply must not undo the user's latest selection while it is saving.
        if (pendingLanguage === null) languageSetting = storedLanguage;
        updateLanguage();
        const stillThere = selected && st.presets.some((p) => p.id === selected);
        if (!stillThere) {
          const act = currentActive();
          const next = (act && st.presets.some((p) => p.id === act) ? act : st.presets[0]?.id) ?? null;
          if (next) { pickPreset(next); return; }
          selected = null;
        }
        render();
        return;
      }
      case 'detail':
        if (msg.presetId === selected) { detail = msg.detail; if (!msg.detail) status = message('presetReadFailed'); render(); }
        return;
      case 'result':
        status = msg.message ?? msg.text; statusLevel = msg.level;
        if (msg.refresh !== false && (msg.presetId === selected || msg.presetId === undefined)) {
          if (selected) toBackend({ type: 'detail', presetId: selected });
        }
        render();
        void switchConn(msg.switchConnection);
        return;
      case 'editor_patch':
        runEditorPatch(msg.presetId, { set: msg.set, remove: msg.remove }).then(
          (r) => toBackend({ type: 'editor_reply', reqId: msg.reqId, ok: true, changed: r.changed, prev: r.prev }),
          (e) => toBackend({ type: 'editor_reply', reqId: msg.reqId, ok: false, error: e instanceof Error ? e.message : String(e), errorMessage: e instanceof LocalizedError ? e.localizedMessage : undefined }),
        );
        return;
      case 'export': {
        const url = URL.createObjectURL(new Blob([msg.text], { type: 'application/json' }));
        const a = el('a', { href: url, download: msg.filename });
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
    }
  });

  // Optional on older hosts. The callback's locale value is intentionally ignored: ko is mapped to en.
  const locale = (ctx as unknown as { locale?: { subscribe?: (listener: () => void) => () => void } }).locale;
  const offLanguage = watchHostLanguage(locale, updateLanguage);
  render();
  reload();

  return () => {
    offBackend(); offActivate(); offSub?.(); offActive?.(); offLanguage();
    offInputClick?.(); inputAction?.destroy();
    if (debounce) clearTimeout(debounce);
    tab.destroy(); removeStyle(); ctx.dom.cleanup();
  };
}
