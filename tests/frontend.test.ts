import { expect, test } from 'bun:test';
import { setup } from '../src/frontend';
import { emptyStore, type ToFrontend } from '../src/shared';
import { installTestDOM } from './dom';
import { runLanguageScenario } from './harness/i18n-browser';

for (const withLocale of [true, false]) {
  test(`rendered labels, draft preservation, host events, manual overrides and cleanup (locale API: ${withLocale})`, async () => {
    const restore = installTestDOM();
    try { await runLanguageScenario(withLocale); } finally { restore(); }
  });
}

test('connection switch failures warn with the original diagnostic while the UI stays translated', async () => {
  const restore = installTestDOM();
  const warnings: unknown[][] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => { warnings.push(args); };
  let teardown = () => {};
  try {
    const root = document.createElement('div');
    let receive: (msg: ToFrontend) => void = () => {};
    teardown = setup({
      dom: { addStyle: () => () => {}, cleanup() {} },
      ui: { registerDrawerTab: () => ({ root, setTitle() {}, setShortName() {}, onActivate: () => () => {}, destroy() {} }) },
      onBackendMessage: (callback: typeof receive) => { receive = callback; return () => {}; },
      sendToBackend() {},
      connections: { setActiveAcknowledged: async () => {
        throw Object.assign(new TypeError('Connection unavailable'), { apiKey: 'synthetic-private-key', preset: 'synthetic-private-prompt' });
      } },
    } as never);
    receive({ type: 'state', ...emptyStore(), presets: [], activePresetId: null, activeSource: null, activeAvailable: false });
    receive({ type: 'result', level: 'info', text: '', refresh: false, switchConnection: 'c1' });
    for (let i = 0; i < 8; i++) await Promise.resolve();
    expect(warnings).toEqual([['[setting-profiles] connection_switch: TypeError: Connection unavailable']]);
    expect(root.textContent).toContain('Could not switch Connection: Could not complete the operation. Try again shortly.');
    expect(root.textContent).not.toContain('Connection unavailable');
  } finally { teardown(); console.warn = originalWarn; restore(); }
});
