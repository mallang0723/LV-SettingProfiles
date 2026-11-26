import { expect, test } from 'bun:test';
import { HOST_LANGUAGE_KEY, resolveLanguage } from '../src/i18n';
import { watchHostLanguage } from '../src/language-events';
import { installTestDOM } from './dom';
import { installTestClock } from './clock';

for (const writeAt of [0, 100, 400]) {
  test(`languageChanged before localStorage write is resolved at the next retry (write at ${writeAt}ms)`, () => {
    const restore = installTestDOM(), clock = installTestClock();
    let dispose = () => {};
    try {
      localStorage.setItem(HOST_LANGUAGE_KEY, 'en');
      let listener = () => {}, language = 'en', calls = 0;
      dispose = watchHostLanguage({ subscribe: (cb) => { listener = cb; return () => {}; } }, () => {
        language = resolveLanguage('auto'); calls++;
      });
      listener(); // Host emits en here even when switching to ko; storage still says en.
      if (writeAt) clock.advance(writeAt);
      localStorage.setItem(HOST_LANGUAGE_KEY, 'ko'); // Same tab: no storage event.
      clock.advance(writeAt === 0 ? 0 : writeAt === 100 ? 50 : 100);
      expect(language).toBe('ko');
      expect(calls).toBe(writeAt === 0 ? 1 : writeAt === 100 ? 2 : 3);
      expect(clock.pending).toBe(0); // Stop as soon as storage changes.
      clock.advance(1000);
      expect(calls).toBe(writeAt === 0 ? 1 : writeAt === 100 ? 2 : 3);
    } finally { dispose(); clock.restore(); restore(); }
  });
}

test('retries are bounded, replaced on a newer event, and cancelled on teardown', () => {
  const restore = installTestDOM(), clock = installTestClock();
  let dispose = () => {};
  try {
    localStorage.setItem(HOST_LANGUAGE_KEY, 'en');
    let listener = () => {}, calls = 0, removed = false;
    dispose = watchHostLanguage({ subscribe: (cb) => { listener = cb; return () => { removed = true; }; } }, () => { calls++; });
    listener(); clock.advance(500);
    expect(calls).toBe(3); expect(clock.pending).toBe(0);
    listener(); clock.advance(0); listener();
    expect(clock.pending).toBe(3);
    dispose(); clock.advance(1000);
    expect(calls).toBe(4); expect(clock.pending).toBe(0); expect(removed).toBe(true);
    listener(); expect(clock.pending).toBe(0);
  } finally { dispose(); clock.restore(); restore(); }
});

test('focus and visibility recover missed host changes without locale support and clean up listeners', () => {
  const restore = installTestDOM();
  let dispose = () => {};
  try {
    let language = 'en', calls = 0;
    dispose = watchHostLanguage(undefined, () => { language = resolveLanguage('auto'); calls++; });
    localStorage.setItem(HOST_LANGUAGE_KEY, 'ko');
    window.dispatchEvent(new Event('focus'));
    expect(language).toBe('ko');
    localStorage.setItem(HOST_LANGUAGE_KEY, 'en');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(calls).toBe(1);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(language).toBe('en'); expect(calls).toBe(2);
    dispose();
    window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange'));
    expect(calls).toBe(2);
  } finally { dispose(); restore(); }
});
