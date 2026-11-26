// Frontend integration scenario. Runs with the test DOM adapter or in a browser harness.
import type { SpindleDrawerTabOptions, SpindleInputBarActionOptions } from 'lumiverse-spindle-types';
import { setup } from '../../src/frontend';
import { describePreset, normalizeProfile } from '../../src/core';
import { HOST_LANGUAGE_KEY } from '../../src/i18n';
import { emptyStore, type ToBackend, type ToFrontend } from '../../src/shared';
import { syntheticPreset } from '../fake-host';

const assert = (condition: unknown, label: string) => { if (!condition) throw new Error(label); };
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

export async function runLanguageScenario(withLocale: boolean) {
  localStorage.setItem(HOST_LANGUAGE_KEY, 'ko');
  const root = document.createElement('div'); document.body.append(root);
  const store = emptyStore();
  store.profiles.push(normalizeProfile({ name: 'Example', presetId: 'p1', sampler: { temperature: 0.8 } })!);
  const sent: ToBackend[] = [];
  let handler: (m: ToFrontend) => void = () => {};
  let localeListener = () => {};
  let localeRemoved = false;
  let title = '', shortName = '', inputLabel = '', inputSubtitle = '';
  let activated = false, inputDestroyed = false, inputOff = false;
  let clickInput = () => {};
  const emit = (m: ToFrontend) => queueMicrotask(() => handler(m));
  const state = () => emit({ type: 'state', ...structuredClone(store), presets: [{ id: 'p1', name: 'Synthetic Preset' }], activePresetId: 'p1', activeSource: null, activeAvailable: true });
  let heldSettings: (() => void) | null = null;
  const ctx = {
    dom: { addStyle: () => () => {}, cleanup() {} },
    ...(withLocale ? { locale: { get: () => 'en', subscribe: (cb: () => void) => { localeListener = cb; return () => { localeRemoved = true; }; } } } : {}),
    ui: {
      registerDrawerTab(options: SpindleDrawerTabOptions) {
        title = options.title; shortName = options.shortName!;
        assert(options.description?.includes('Sampler') && options.description.includes('샘플러'), 'bilingual immutable drawer description');
        assert(options.keywords?.includes('Profiles') && options.keywords.includes('프로필'), 'bilingual search keywords');
        assert(!options.headerTitle, 'header follows mutable title');
        return { root, setTitle: (s: string) => { title = s; }, setShortName: (s: string) => { shortName = s; }, onActivate: () => () => {}, activate: () => { activated = true; }, destroy() {} };
      },
      registerInputBarAction(options: SpindleInputBarActionOptions) {
        inputLabel = options.label;
        return { setLabel: (s: string) => { inputLabel = s; }, setSubtitle: (s: string) => { inputSubtitle = s; }, onClick: (cb: () => void) => { clickInput = cb; return () => { inputOff = true; }; }, destroy: () => { inputDestroyed = true; } };
      },
    },
    onBackendMessage: (cb: (m: ToFrontend) => void) => { handler = cb; return () => {}; },
    sendToBackend(m: ToBackend) {
      sent.push(m);
      if (m.type === 'load') state();
      if (m.type === 'detail') emit({ type: 'detail', presetId: 'p1', detail: describePreset(syntheticPreset()) });
      if (m.type === 'set_settings') heldSettings = () => { Object.assign(store.settings, m.settings); state(); };
    },
  };
  const teardown = setup(ctx as never);
  await tick();
  const contains = (text: string) => root.textContent?.includes(text);
  const button = (text: string) => Array.from(root.querySelectorAll('button')).find((b) => b.textContent === text)!;
  const chooseLanguage = (value: string) => {
    const select = root.querySelector<HTMLSelectElement>('#sp-language')!;
    select.value = value; select.dispatchEvent(new Event('change'));
  };
  const acknowledge = async () => { (heldSettings as (() => void) | null)?.(); heldSettings = null; await tick(); };

  assert(contains('대상 프리셋'), 'host ko wins even though ctx.locale.get() is en');
  button('현재 값으로 저장').click();
  const name = root.querySelector<HTMLInputElement>('input[maxlength="80"]')!;
  name.value = 'Unsaved draft'; name.dispatchEvent(new Event('input'));
  chooseLanguage('en');
  // No backend reply yet: the UI must switch synchronously.
  assert(contains('Target Preset') && contains('Prompt Variables') && contains('Use sampler values'), 'switch translates rendered labels immediately');
  assert(root.querySelector<HTMLInputElement>('input[maxlength="80"]')?.value === 'Unsaved draft', 'switch preserves unsaved form');
  assert(title === 'Setting Profiles' && shortName === 'Profiles' && inputLabel === 'Setting Profiles', 'host surfaces update immediately');
  assert(inputSubtitle.includes('Sampler'), 'input bar subtitle updates');
  assert(sent.at(-1)?.type === 'set_settings' && sent.at(-1)?.language === 'en', 'resolved language accompanies settings request');
  state(); await tick();
  assert(contains('Target Preset'), 'stale state reply cannot undo a pending language selection');
  await acknowledge();
  localStorage.setItem(HOST_LANGUAGE_KEY, 'ko'); localeListener();
  window.dispatchEvent(new StorageEvent('storage', { key: HOST_LANGUAGE_KEY }));
  assert(contains('Target Preset'), 'manual English overrides live host Korean');
  chooseLanguage('auto'); await acknowledge();
  assert(contains('대상 프리셋'), 'Auto returns to host Korean');
  localStorage.setItem(HOST_LANGUAGE_KEY, 'en');
  if (withLocale) localeListener();
  else window.dispatchEvent(new StorageEvent('storage', { key: HOST_LANGUAGE_KEY }));
  assert(contains('Target Preset'), 'live host English is reread, including legacy host without locale');
  localStorage.setItem(HOST_LANGUAGE_KEY, 'ko');
  window.dispatchEvent(new StorageEvent('storage', { key: HOST_LANGUAGE_KEY }));
  assert(contains('대상 프리셋'), 'storage event updates Auto');
  chooseLanguage('ko'); await acknowledge();
  localStorage.setItem(HOST_LANGUAGE_KEY, 'en'); localeListener();
  window.dispatchEvent(new StorageEvent('storage', { key: HOST_LANGUAGE_KEY }));
  assert(contains('대상 프리셋'), 'manual Korean overrides host English');
  chooseLanguage('en'); await acknowledge();
  button('Cancel').click();
  let confirmation = '';
  window.confirm = (s) => { confirmation = s ?? ''; return false; };
  button('Delete').click();
  assert(confirmation === 'Delete profile ‘Example’?', 'delete confirmation translated');
  clickInput(); assert(activated, 'input bar opens drawer');
  teardown();
  assert(!withLocale || localeRemoved, 'locale subscription disposed');
  assert(inputDestroyed && inputOff, 'input action disposed');
  const oldTitle = title;
  localStorage.setItem(HOST_LANGUAGE_KEY, 'ko');
  window.dispatchEvent(new StorageEvent('storage', { key: HOST_LANGUAGE_KEY }));
  assert(title === oldTitle, 'storage listener disposed');
  root.remove();
}

