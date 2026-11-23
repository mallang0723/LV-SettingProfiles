import { describe, expect, test } from 'bun:test';
import {
  applyProfile, commit, describePreset, exportProfiles, importProfiles, normalizeStore, planApply, undoBackup,
  type PresetLike,
} from '../src/core';
import { emptyStore, type Profile } from '../src/shared';
import { parseSampler, parseVariable } from '../src/frontend';
import { FakeHost, syntheticBlocks, syntheticPreset } from './fake-host';

const blocks = syntheticBlocks;
const makePreset = syntheticPreset;

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: 'prof1', name: 'Model B', presetId: 'p1', presetName: 'Synthetic Preset',
  sampler: { temperature: 0.75, topP: 0.95, topK: null }, variables: { b1: { plan: 'b', risky: 1 } },
  connectionId: null, autoConnectionIds: [], createdAt: 1, updatedAt: 1, ...over,
});

describe('apply', () => {
  test('partial apply changes only profile keys and never sends blocks, prompts or name', async () => {
    const host = new FakeHost();
    const store = emptyStore();
    const r = await applyProfile(host, store, profile(), { before: null, switchedTo: null });
    expect(r.status).toBe('applied');
    expect(host.updates).toHaveLength(1);
    const u = host.updates[0]!;
    expect(Object.keys(u).sort()).toEqual(['expected_cache_revision', 'metadata', 'parameters']);
    expect(u.expected_cache_revision).toBe(7);
    const so = (host.preset.parameters.samplerOverrides as Record<string, unknown>);
    expect(so).toEqual({ enabled: true, temperature: 0.75, topP: 0.95, topK: null, maxTokens: null });
    expect(host.preset.parameters.customBody).toEqual({ enabled: false, rawJson: '{}' });
    expect(host.preset.metadata.description).toBe('keep me');
    expect(host.preset.metadata.promptVariables).toEqual({ b1: { plan: 'b', risky: 1 } });
    expect(JSON.stringify(host.preset.prompt_order)).toBe(JSON.stringify(blocks()));
  });

  test('no change means no write and no backup', async () => {
    const host = new FakeHost();
    const store = emptyStore();
    await applyProfile(host, store, profile(), { before: null, switchedTo: null });
    host.updates.length = 0;
    delete store.backups.p1;
    const r = await applyProfile(host, store, profile(), { before: null, switchedTo: null });
    expect(r.status).toBe('noop');
    expect(host.updates).toHaveLength(0);
    expect(store.backups.p1).toBeUndefined();
  });

  test('sampler-only profile does not send metadata and vice versa', async () => {
    const host = new FakeHost();
    await applyProfile(host, emptyStore(), profile({ variables: {} }), { before: null, switchedTo: null });
    expect(Object.keys(host.updates[0]!).sort()).toEqual(['expected_cache_revision', 'parameters']);
    expect(host.updates[0]!.metadata).toBeUndefined();
    const h2 = new FakeHost();
    await applyProfile(h2, emptyStore(), profile({ sampler: {} }), { before: null, switchedTo: null });
    expect(h2.updates[0]!.parameters).toBeUndefined();
  });

  test('variables missing from the preset are skipped, not written', () => {
    const plan = planApply(makePreset(), { sampler: {}, variables: { b1: { nope: 'x' }, ghost: { a: 1 } } });
    expect(plan.metadata).toBeUndefined();
    expect(plan.skipped).toHaveLength(2);
  });

  test('revision conflict: re-read and retry once, then report', async () => {
    const host = new FakeHost();
    host.bumpBeforeUpdate = 1;
    const r1 = await applyProfile(host, emptyStore(), profile(), { before: null, switchedTo: null });
    expect(r1.status).toBe('applied');
    expect(host.updates.map((u) => u.expected_cache_revision)).toEqual([7, 8]);
    const h2 = new FakeHost();
    h2.bumpBeforeUpdate = 2;
    const r2 = await applyProfile(h2, emptyStore(), profile(), { before: null, switchedTo: null });
    expect(r2.status).toBe('conflict');
    expect(h2.updates).toHaveLength(2);
    expect(h2.preset.parameters.samplerOverrides).toEqual(makePreset().parameters.samplerOverrides);
  });

  test('missing preset', async () => {
    const r = await commit(new FakeHost(), 'nope', (p) => planApply(p, profile()));
    expect(r.status).toBe('missing');
  });
});

describe('undo', () => {
  test('restores previous values and removes keys that did not exist', async () => {
    const host = new FakeHost();
    host.preset.parameters = { samplerOverrides: { enabled: true, temperature: 1 } };
    const before = JSON.stringify(host.preset);
    const store = emptyStore();
    await applyProfile(host, store, profile(), { before: 'cA', switchedTo: 'cB' });
    expect(store.backups.p1!.connectionBefore).toBe('cA');
    const r = await undoBackup(host, store, 'p1');
    expect(r.status).toBe('applied');
    const after = JSON.parse(JSON.stringify(host.preset)) as PresetLike;
    expect(after.parameters).toEqual(JSON.parse(before).parameters);
    expect(after.metadata.promptVariables).toEqual({ b1: { plan: 'a' } });
    expect(store.backups.p1).toBeUndefined();
    expect(JSON.stringify(after.prompt_order)).toBe(JSON.stringify(blocks()));
  });

  test('without backup nothing is written', async () => {
    const host = new FakeHost();
    const r = await undoBackup(host, emptyStore(), 'p1');
    expect(r.status).toBe('missing');
    expect(host.updates).toHaveLength(0);
  });
});

describe('describePreset and store', () => {
  test('lists variables with overrides and defaults', () => {
    const d = describePreset(makePreset());
    expect(d.sampler.temperature).toBe(1);
    expect(d.variables.map((v) => [v.name, v.hasCurrent])).toEqual([['plan', true], ['risky', false], ['note', false]]);
  });
  test('normalizeStore drops junk and prototype keys', () => {
    const s = normalizeStore(JSON.parse('{"profiles":[{"name":"x","presetId":"p","sampler":{"temperature":"hot","topK":null,"zzz":1},"variables":{"__proto__":{"a":1},"b":{"c":2}}},{"name":""}],"settings":{"autoApply":1}}'));
    expect(s.profiles).toHaveLength(1);
    expect(s.profiles[0]!.sampler).toEqual({ topK: null });
    expect(Object.keys(s.profiles[0]!.variables)).toEqual(['b']);
    expect(({} as Record<string, unknown>).a).toBeUndefined();
    expect(s.settings.autoApply).toBe(false);
  });
  test('export then import keeps values, renames duplicates, assigns new ids', () => {
    const a = emptyStore();
    a.profiles.push(profile());
    const text = exportProfiles(a);
    const b = emptyStore();
    b.profiles.push(profile({ id: 'other' }));
    const r = importProfiles(b, text);
    expect(r.added).toBe(1);
    expect(b.profiles[1]!.name).toBe('Model B (2)');
    expect(b.profiles[1]!.id).not.toBe('prof1');
    expect(b.profiles[1]!.sampler).toEqual({ temperature: 0.75, topP: 0.95, topK: null });
    expect(importProfiles(b, '{"x":1}').added).toBe(0);
    expect(importProfiles(b, 'not json').errors.length).toBe(1);
  });
});

describe('form parsing', () => {
  test('sampler: empty is null, text is rejected', () => {
    expect(parseSampler('topK', '')).toBeNull();
    expect(parseSampler('temperature', '0.75')).toBe(0.75);
    expect(() => parseSampler('temperature', 'abc')).toThrow();
    expect(parseSampler('streaming', 'false')).toBe(false);
  });
  test('variables by type', () => {
    expect(parseVariable('switch', '1')).toBe(1);
    expect(parseVariable('number', '3')).toBe(3);
    expect(parseVariable('select', 'b')).toBe('b');
    expect(parseVariable('multiselect', '["a"]')).toEqual(['a']);
    expect(() => parseVariable('number', '')).toThrow();
  });
});
