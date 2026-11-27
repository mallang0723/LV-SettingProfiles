import { expect, test } from 'bun:test';
import { messages, renderMessage } from '../src/i18n';
import { emptyStore, type Store, type ToBackend, type ToFrontend } from '../src/shared';
import { FakeHost } from './fake-host';

test('backend persists language per user and localizes results, imports, auto-apply toasts and failures', async () => {
  const stored = new Map<string, Store>();
  const hosts = new Map<string, FakeHost>();
  const logs: string[] = [];
  const toasts: Array<{ user: string; text: string }> = [];
  let handler: (m: ToBackend, user: string, session: string) => void = () => {};
  const waiters = new Map<string, (m: ToFrontend) => void>();
  let failRead = false;
  const host = (user: string) => {
    if (!hosts.has(user)) hosts.set(user, new FakeHost());
    return hosts.get(user)!;
  };
  const toast = (text: string, options: { userId: string }) => { toasts.push({ user: options.userId, text }); };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'spindle');
  Object.defineProperty(globalThis, 'spindle', { configurable: true, value: {
    userStorage: {
      getJson: async (_path: string, { userId }: { userId: string }) => structuredClone(stored.get(userId) ?? null),
      setJson: async (_path: string, value: Store, { userId }: { userId: string }) => { stored.set(userId, structuredClone(value)); },
    },
    presets: {
      list: async ({ userId }: { userId: string }) => ({ data: [host(userId).preset] }),
      get: async (id: string, user: string) => { if (failRead) throw new Error('host failure'); return host(user).get(id); },
      update: async (id: string, input: Parameters<FakeHost['update']>[1], user: string) => host(user).update(id, input),
    },
    toast: { info: toast, warning: toast, error: toast },
    log: { error(text: string) { logs.push(text); } },
    sendToFrontend: (m: ToFrontend, user: string) => waiters.get(user)?.(m),
    onFrontendMessage: (cb: typeof handler) => { handler = cb; },
  } });
  const request = (user: string, msg: ToBackend, until: ToFrontend['type'] = 'state') => new Promise<ToFrontend[]>((resolve, reject) => {
    const received: ToFrontend[] = [];
    const timeout = setTimeout(() => { waiters.delete(user); reject(new Error(`No ${until} response`)); }, 1000);
    waiters.set(user, (m) => {
      received.push(m);
      if (m.type === until) { clearTimeout(timeout); waiters.delete(user); resolve(received); }
    });
    handler(msg, user, 'session');
  });
  const resultText = (results: ToFrontend[]) => results.find((r) => r.type === 'result')?.text;
  try {
    await import('../src/backend');
    // Simulate an existing store with no language setting.
    stored.set('account-a', { ...emptyStore(), settings: { autoApply: true } } as Store);
    await Promise.all([
      request('account-a', { type: 'set_settings', settings: { language: 'en' }, language: 'en' }),
      request('account-b', { type: 'set_settings', settings: { language: 'ko' }, language: 'ko' }),
    ]);
    expect(stored.get('account-a')!.settings).toEqual({ autoApply: true, language: 'en' });
    expect(stored.get('account-b')!.settings).toEqual({ autoApply: false, language: 'ko' });
    const [en, ko] = await Promise.all([
      request('account-a', { type: 'save_profile', profile: { name: 'Example', presetId: 'p1', sampler: { temperature: 0.5 }, autoConnectionIds: ['c1'] }, language: 'en' }),
      request('account-b', { type: 'save_profile', profile: { name: 'Example', presetId: 'p1' }, language: 'ko' }),
    ]);
    expect(resultText(en)).toBe('Saved profile ‘Example’.');
    expect(resultText(ko)).toBe("'Example' 프로필을 저장했습니다.");
    const savedMessage = en.find((r) => r.type === 'result')!.message!;
    expect(renderMessage('ko', JSON.parse(JSON.stringify(savedMessage)))).toBe("'Example' 프로필을 저장했습니다.");
    const loaded = await request('account-a', { type: 'load', chatId: null, language: 'en' });
    expect(loaded[0]!.type === 'state' && loaded[0]!.settings.language).toBe('en');
    const invalidImport = await request('account-a', { type: 'import', text: '{', language: 'en' });
    expect(resultText(invalidImport)).toBe(`${messages.en.importEmpty}\n${messages.en.invalidJson}`);
    expect(renderMessage('ko', invalidImport.find((r) => r.type === 'result')!.message!)).toBe(`${messages.ko.importEmpty}\n${messages.ko.invalidJson}`);
    await request('account-a', { type: 'connection_changed', connectionId: 'c1', chatId: null, activePresetId: 'p1', language: 'en' });
    expect(toasts.at(-1)?.text).toBe('Auto-apply ‘Example’ completed.');
    expect(host('account-a').preset.parameters.samplerOverrides).toMatchObject({ temperature: 0.5 });
    await request('account-a', { type: 'set_settings', settings: { autoApply: false }, language: 'en' });
    expect(stored.get('account-a')!.settings.language).toBe('en');
    failRead = true;
    const profileId = stored.get('account-a')!.profiles[0]!.id;
    const applyFailure = await request('account-a', { type: 'apply', id: profileId, chatId: null, activeConnectionId: null, switched: false, language: 'en' }, 'result');
    expect(logs.at(-1)).toBe('[setting-profiles] apply: Error: host failure');
    expect(resultText(applyFailure)).toContain(messages.en.unexpectedError);
    expect(resultText(applyFailure)).not.toContain('host failure');
    const undoFailure = await request('account-a', { type: 'undo', presetId: 'p1', language: 'en' }, 'result');
    expect(logs.at(-1)).toBe('[setting-profiles] undo: Error: host failure');
    expect(resultText(undoFailure)).toContain(messages.en.unexpectedError);
    expect(resultText(undoFailure)).not.toContain('host failure');
    const failure = await request('account-a', { type: 'detail', presetId: 'p1', language: 'en' }, 'result');
    expect(resultText(failure)).toBe(messages.en.unexpectedError);
    expect(failure[0]!.type === 'result' && failure[0]!.refresh).toBe(false);
    expect(toasts.at(-1)?.text).toBe(messages.en.unexpectedError);
  } finally {
    if (original) Object.defineProperty(globalThis, 'spindle', original);
    else Reflect.deleteProperty(globalThis, 'spindle');
  }
});
