import { describe, expect, test } from 'bun:test';
import { messages, readHostLanguage, resolveLanguage, translate, type MessageKey } from '../src/i18n';
import { emptyStore, SAMPLER_LABEL_KEYS } from '../src/shared';
import { exportProfiles, fallbackNote, importProfiles, normalizeStore, samplerDisabledWarning } from '../src/core';
import { checkVariableShape, parseSampler, parseVariable } from '../src/frontend';

describe('translations', () => {
  test('both languages have every key, nonempty text, and matching placeholders', () => {
    expect(Object.keys(messages.ko).sort()).toEqual(Object.keys(messages.en).sort());
    for (const key of Object.keys(messages.ko) as MessageKey[]) {
      expect(messages.ko[key].trim().length).toBeGreaterThan(0);
      expect(messages.en[key].trim().length).toBeGreaterThan(0);
      const params = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(params(messages.ko[key])).toEqual(params(messages.en[key]));
    }
    for (const key of Object.values(SAMPLER_LABEL_KEYS)) expect(messages.en[key]).toBeDefined();
  });

  test('interpolated user content is preserved literally and not translated recursively', () => {
    expect(translate('en', 'profileSaved', { name: '$& {count} <test>' })).toBe('Saved profile ‘$& {count} <test>’.');
  });

  test('validation, import errors, and editor warnings use the requested language', () => {
    expect(() => parseSampler('topP', 'x', 'en')).toThrow(messages.en.notNumber);
    expect(() => parseVariable('range', '[', 'en')).toThrow(messages.en.invalidVariableJson);
    expect(() => checkVariableShape('range', [], [5, 1], 'en')).toThrow(messages.en.rangeOrder);
    expect(importProfiles(emptyStore(), '{', 0, 'en').errors).toEqual([messages.en.invalidJson]);
    expect(importProfiles(emptyStore(), '{}', 0, 'en').errors).toEqual([messages.en.invalidExport]);
    expect(fallbackNote({ detected: true, reason: 'blocks[0].group' }, true, 'en')).toContain(messages.en.editorVariablesNote);
    expect(samplerDisabledWarning({ parameters: {} }, { sampler: { topP: 1 } }, 'en')).toBe(messages.en.samplerDisabled);
    expect(() => parseSampler('topP', 'x', 'ko')).toThrow('숫자가 아닙니다');
  });
});

describe('Auto language resolution', () => {
  test('host Korean wins over an English browser', () => {
    expect(resolveLanguage('auto', 'ko', 'en-US')).toBe('ko');
  });
  test('every other stored value wins over a Korean browser', () => {
    for (const host of ['en', 'zh', 'zh-TW', 'ja', 'fr', 'it', 'de', 'unknown', '']) {
      expect(resolveLanguage('auto', host, 'ko-KR')).toBe('en');
    }
  });
  test('only an absent host preference falls back to navigator.language', () => {
    expect(resolveLanguage('auto', null, 'ko-KR')).toBe('ko');
    expect(resolveLanguage('auto', null, 'ko')).toBe('ko');
    expect(resolveLanguage('auto', null, 'en-US')).toBe('en');
    expect(resolveLanguage('auto', null, '')).toBe('en');
  });
  test('manual selection overrides host and browser', () => {
    expect(resolveLanguage('en', 'ko', 'ko-KR')).toBe('en');
    expect(resolveLanguage('ko', 'en', 'en-US')).toBe('ko');
  });
  test('unavailable or throwing storage is treated as absent', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    try {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
      expect(readHostLanguage()).toBeNull();
      expect(resolveLanguage('auto', readHostLanguage(), 'ko-KR')).toBe('ko');
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem() { throw new Error('denied'); } } });
      expect(readHostLanguage()).toBeNull();
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });
      expect(readHostLanguage()).toBeNull();
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });
  test('older stores migrate to Auto; valid options survive and exports exclude settings', () => {
    expect(emptyStore().settings.language).toBe('auto');
    expect(normalizeStore({ settings: { autoApply: true } }).settings).toEqual({ autoApply: true, language: 'auto' });
    for (const language of ['auto', 'ko', 'en'] as const) {
      expect(normalizeStore({ settings: { language } }).settings.language).toBe(language);
    }
    expect(normalizeStore({ settings: { language: 'invalid' } }).settings.language).toBe('auto');
    expect(JSON.parse(exportProfiles(emptyStore())).settings).toBeUndefined();
  });
});
