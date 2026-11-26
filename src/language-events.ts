import { HOST_LANGUAGE_KEY, readHostLanguage } from './i18n';

type LocaleEvents = { subscribe?: (listener: () => void) => () => void };

/** Host languageChanged fires before changeUiLanguage persists its new value. */
export function watchHostLanguage(locale: LocaleEvents | undefined, update: () => void): () => void {
  let timers: Array<ReturnType<typeof setTimeout>> = [];
  let disposed = false;
  const cancelRetries = () => { timers.forEach(clearTimeout); timers = []; };
  const onLocale = () => {
    if (disposed) return;
    cancelRetries();
    const before = readHostLanguage();
    timers = [0, 150, 500].map((delay) => setTimeout(() => {
      if (disposed) return;
      update();
      if (readHostLanguage() !== before || delay === 500) cancelRetries();
    }, delay));
  };
  let offLocale: (() => void) | undefined;
  try { offLocale = locale?.subscribe?.(onLocale); } catch { /* Older hosts may lack a usable locale API. */ }
  const onStorage = (event: StorageEvent) => {
    if (event.key === HOST_LANGUAGE_KEY || event.key === null) update();
  };
  const onVisible = () => { if (document.visibilityState === 'visible') update(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener('focus', update);
  window.addEventListener('languagechange', update);
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    disposed = true;
    cancelRetries();
    offLocale?.();
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('focus', update);
    window.removeEventListener('languagechange', update);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
