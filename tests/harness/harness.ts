// Browser harness: the real frontend bundle against a fake Lumiverse context and an in-page backend built on the real core.
import { applyProfile, describePreset, exportProfiles, importProfiles, normalizeProfile, undoBackup } from '../../src/core';
import { normalizeLanguage, translator } from '../../src/i18n';
import { setup } from '../../src/frontend';
import { emptyStore, newId, type ToBackend, type ToFrontend } from '../../src/shared';
import { FakeHost } from '../fake-host';

const host = new FakeHost();
const store = emptyStore();
(window as unknown as { __host: FakeHost; __store: typeof store }).__host = host;
(window as unknown as { __store: typeof store }).__store = store;
let handler: (m: unknown) => void = () => {};
let activeConn = 'c1';
const subs = new Set<(v: { activeProfileId: string | null }) => void>();
(window as unknown as Record<string, unknown>).__switchConn = (id: string) => { activeConn = id; subs.forEach((h) => h({ activeProfileId: id })); };
(window as unknown as Record<string, unknown>).__conn = () => activeConn;
const out = (m: ToFrontend) => queueMicrotask(() => handler(m));
const state = (): ToFrontend => ({ type: 'state', profiles: store.profiles, backups: store.backups, settings: store.settings, presets: [{ id: 'p1', name: 'Synthetic Preset' }], activePresetId: 'p1', activeSource: 'none', activeAvailable: true });

async function backend(m: ToBackend): Promise<void> {
  const t = translator(m.language === 'en' ? 'en' : 'ko');
  const result = (status: string, action: string) => status === 'applied' ? t('appliedResult', { action, skip: '' }) : status === 'noop' ? t('noopResult', { action }) : t(status === 'missing' ? 'presetMissing' : 'conflict');
  switch (m.type) {
    case 'load': out(state()); return;
    case 'detail': out({ type: 'detail', presetId: m.presetId, detail: describePreset((await host.get(m.presetId))!) }); return;
    case 'save_profile': {
      const p = normalizeProfile({ ...m.profile, presetName: 'Synthetic Preset' })!;
      const ex = store.profiles.findIndex((x) => x.id === m.profile.id);
      if (ex >= 0) store.profiles[ex] = { ...p, id: store.profiles[ex]!.id }; else { p.id = newId('prof'); store.profiles.push(p); }
      out({ type: 'result', level: 'info', text: t('profileSaved', { name: p.name }) }); out(state()); return;
    }
    case 'delete': store.profiles = store.profiles.filter((p) => p.id !== m.id); out(state()); return;
    case 'apply': {
      const p = store.profiles.find((x) => x.id === m.id)!;
      const r = await applyProfile(host, store, p, { before: m.activeConnectionId, switchedTo: m.switched ? p.connectionId : null });
      out({ type: 'result', level: 'info', text: result(r.status, t('applyAction', { name: p.name })), presetId: p.presetId, switchConnection: m.switched ? p.connectionId : undefined });
      out(state()); return;
    }
    case 'undo': { const b = store.backups[m.presetId]; const r = await undoBackup(host, store, m.presetId); out({ type: 'result', level: 'info', text: result(r.status, t('undoAction')), presetId: m.presetId, switchConnection: r.status === 'applied' && b?.connectionSwitchedTo ? b.connectionBefore : undefined }); out(state()); return; }
    case 'connection_changed': {
      if (!store.settings.autoApply) return;
      const p = store.profiles.find((x) => x.autoConnectionIds.includes(m.connectionId ?? ''));
      if (p) { await applyProfile(host, store, p, { before: m.connectionId, switchedTo: null }); out({ type: 'result', level: 'info', text: result('applied', t('autoApplyAction', { name: p.name })), presetId: p.presetId }); out(state()); }
      return;
    }
    case 'export': out({ type: 'export', text: exportProfiles(store), filename: 'setting-profiles.json' }); return;
    case 'import': { const r = importProfiles(store, m.text, Date.now(), m.language === 'en' ? 'en' : 'ko'); out({ type: 'result', level: 'info', text: [t('importCount', { count: r.added }), ...r.errors].join('\n') }); out(state()); return; }
    case 'set_settings': if (m.settings.language !== undefined) store.settings.language = normalizeLanguage(m.settings.language); if (typeof m.settings.autoApply === 'boolean') store.settings.autoApply = m.settings.autoApply; out(state()); return;
    case 'notify': return;
  }
}

const tabRoot = document.getElementById('tab')!;
const ctx = {
  dom: { addStyle(css: string) { const s = document.createElement('style'); s.textContent = css; document.head.append(s); return () => s.remove(); }, cleanup() {} },
  ui: { registerDrawerTab: () => ({ root: tabRoot, tabId: 't', setTitle() {}, setShortName() {}, setBadge() {}, activate() {}, destroy() {}, onActivate: () => () => {} }) },
  sendToBackend: (m: unknown) => { void backend(m as ToBackend); },
  onBackendMessage: (h: (m: unknown) => void) => { handler = h; return () => {}; },
  connections: {
    list: () => [{ id: 'c1', name: 'Model A', model: 'model-a' }, { id: 'c2', name: 'Model B', model: 'model-b' }],
    getActive: () => ({ activeProfileId: activeConn }),
    subscribe: (h: (v: { activeProfileId: string | null }) => void) => { subs.add(h); return () => subs.delete(h); },
    setActiveAcknowledged: async (id: string) => { (window as unknown as { __switchConn: (i: string) => void }).__switchConn(id); },
  },
};
setup(ctx as never);
