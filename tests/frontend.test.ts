import { test } from 'bun:test';
import { installTestDOM } from './dom';
import { runLanguageScenario } from './harness/i18n-browser';

for (const withLocale of [true, false]) {
  test(`rendered labels, draft preservation, host events, manual overrides and cleanup (locale API: ${withLocale})`, async () => {
    const restore = installTestDOM();
    try { await runLanguageScenario(withLocale); } finally { restore(); }
  });
}
