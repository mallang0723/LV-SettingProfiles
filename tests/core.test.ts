import { describe, expect, test } from 'bun:test';
import {
  applyProfile, applyProfileViaEditor, commit, describePreset, editorBlocks, resolveActive, samplerDisabledWarning, samplerPatch, samplerPrechecked,
  undoBackupViaEditor, variablePrechecked, writeRoute, exportProfiles, importProfiles, normalizeStore, planApply, undoBackup,
  type PresetLike,
} from '../src/core';
import { emptyStore, type Profile } from '../src/shared';
import { checkVariableShape, parseSampler, parseVariable } from '../src/frontend';
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

describe('sampler switch and editor guard', () => {
  test('warns when the preset has sampler use off (or no overrides) and the profile carries sampler values', async () => {
    const host = new FakeHost();
    host.preset.parameters.samplerOverrides = { enabled: false, temperature: 1 };
    const r = await applyProfile(host, emptyStore(), profile(), { before: null, switchedTo: null });
    expect(r.status).toBe('applied');
    if (r.status !== 'applied') return;
    expect(samplerDisabledWarning(r.preset, profile())).not.toBeNull();
    expect(samplerDisabledWarning({ parameters: {} }, profile())).not.toBeNull();
    // profile that turns it on, or that has no sampler values, or a preset that is already on: no warning
    expect(samplerDisabledWarning({ parameters: { samplerOverrides: { enabled: true } } }, profile())).toBeNull();
    expect(samplerDisabledWarning(r.preset, profile({ sampler: {} }))).toBeNull();
    // the check runs on the preset as written by the apply, so a profile that turns it on clears the warning
    const host2 = new FakeHost();
    host2.preset.parameters.samplerOverrides = { enabled: false };
    const p2 = profile({ sampler: { enabled: true, topP: 0.9 } });
    const r2 = await applyProfile(host2, emptyStore(), p2, { before: null, switchedTo: null });
    if (r2.status === 'applied') expect(samplerDisabledWarning(r2.preset, p2)).toBeNull();
  });

  test('the editor blocks writes only for the preset it has open', () => {
    expect(editorBlocks('p1', 'p1')).toBe(true);
    expect(editorBlocks('p2', 'p1')).toBe(false);
    expect(editorBlocks(null, 'p1')).toBe(false);
  });

  test('undo that changes nothing does not write', async () => {
    const host = new FakeHost();
    const store = emptyStore();
    await applyProfile(host, store, profile(), { before: null, switchedTo: null });
    await undoBackup(host, store, 'p1');
    store.backups.p1 = { presetId: 'p1', profileId: 'x', profileName: 'x', at: 1, sampler: { temperature: { had: true, value: 1 } }, variables: {}, connectionBefore: null, connectionSwitchedTo: null };
    host.preset.parameters.samplerOverrides = { ...(host.preset.parameters.samplerOverrides as object), temperature: 1 };
    const n = host.updates.length;
    const r = await undoBackup(host, store, 'p1');
    expect(r.status).toBe('noop');
    expect(host.updates.length).toBe(n);
  });
});

// Stand-in for the host's preset editor: it keeps its own draft and, like the real one, writes the whole
// parameters object back when it saves (with a revision bump).
class FakeEditor {
  draft: Record<string, unknown>;
  constructor(private host: FakeHost) { this.draft = JSON.parse(JSON.stringify(host.preset.parameters)) as Record<string, unknown>; }
  sampler = async (patch: { set: Record<string, never>; remove: string[] }) => {
    const r = samplerPatch(this.draft.samplerOverrides, patch);
    if (r.changed) this.draft = { ...this.draft, samplerOverrides: r.next };
    await this.save();
    return { changed: r.changed, prev: r.prev };
  };
  async save() {
    this.host.preset.parameters = JSON.parse(JSON.stringify(this.draft));
    this.host.preset.cache_revision! += 1;
  }
}

describe('opening the preset editor', () => {
  test('first open: only values that differ from defaults are pre-checked', () => {
    const detail = describePreset(makePreset());
    // every numeric sampler defaults to unset (null): set ones are checked, null ones and the two switches are not
    expect(['temperature', 'topP', 'topK', 'maxTokens', 'enabled', 'streaming', 'minP'].map((k) => samplerPrechecked(detail, k))).toEqual([true, true, true, false, false, false, false]);
    // variables: stored value equal to the default is not "changed"
    const vars = Object.fromEntries(detail.variables.map((v) => [v.name, variablePrechecked(v)]));
    expect(vars).toEqual({ plan: false, risky: false, note: false });
    const p = makePreset();
    (p.metadata.promptVariables as Record<string, Record<string, unknown>>).b1 = { plan: 'b', risky: 0, note: 'hi' };
    const d2 = describePreset(p);
    expect(Object.fromEntries(d2.variables.map((v) => [v.name, variablePrechecked(v)]))).toEqual({ plan: true, risky: false, note: true });
  });

  test('a preset with every key stored (null = unset) does not check everything', () => {
    const p = makePreset();
    p.parameters.samplerOverrides = { enabled: true, maxTokens: null, contextSize: null, temperature: null, topP: null, minP: null, topK: null, frequencyPenalty: null, presencePenalty: null, repetitionPenalty: null, streaming: true };
    const d = describePreset(p);
    expect(Object.keys(d.sampler).filter((k) => samplerPrechecked(d, k))).toEqual([]);
  });
});

describe('active preset detection', () => {
  test('the frontend hint answers when the host worker has no getActive', () => {
    expect(resolveActive('p9', null)).toEqual({ id: 'p9', source: null, known: true });
    expect(resolveActive(null, null)).toEqual({ id: null, source: null, known: true });
  });
  test('no hint and no host call means unknown, not "no preset"', () => {
    expect(resolveActive(undefined, null)).toEqual({ id: null, source: null, known: false });
    expect(resolveActive(undefined, null, 'old')).toEqual({ id: 'old', source: null, known: true });
  });
  test('the host call fills in the source and answers when there is no hint', () => {
    expect(resolveActive('p9', { preset_id: 'p1', source: 'chat' })).toEqual({ id: 'p9', source: 'chat', known: true });
    expect(resolveActive(undefined, { preset_id: 'p1', source: 'chat' })).toEqual({ id: 'p1', source: 'chat', known: true });
  });
});

describe('applying through the open editor', () => {
  test('routing: direct, editor draft, or refusal when the host cannot take editor writes', () => {
    expect(writeRoute({ editorPresetId: null }, 'p1', true)).toBe('direct');
    expect(writeRoute({ editorPresetId: 'p2', editorDraft: true }, 'p1', true)).toBe('direct');
    expect(writeRoute({ editorPresetId: 'p1', editorDraft: true }, 'p1', true)).toBe('editor');
    expect(writeRoute({ editorPresetId: 'p1', editorDraft: false }, 'p1', true)).toBe('refuse');
    expect(writeRoute({ editorPresetId: 'p1', editorDraft: true }, 'p1', false)).toBe('refuse');
  });

  test('samplers go through the editor draft, variables through the host, and a later editor save keeps them', async () => {
    const host = new FakeHost();
    const editor = new FakeEditor(host);
    const store = emptyStore();
    const r = await applyProfileViaEditor(host, store, profile(), { before: null, switchedTo: null }, editor.sampler as never);
    expect(r.status).toBe('applied');
    // the host write carried only the variables
    expect(host.updates).toHaveLength(1);
    expect(host.updates[0]!.parameters).toBeUndefined();
    expect(host.preset.metadata.promptVariables).toEqual({ b1: { plan: 'b', risky: 1 } });
    const so = host.preset.parameters.samplerOverrides as Record<string, unknown>;
    expect(so).toMatchObject({ temperature: 0.75, topP: 0.95, topK: null });
    // the editor draft and the stored preset agree
    expect(editor.draft.samplerOverrides).toEqual(so);
    // the user now edits an unrelated value in the editor: the apply is not reverted
    editor.draft = { ...editor.draft, samplerOverrides: { ...(editor.draft.samplerOverrides as object), minP: 0.05 } };
    await editor.save();
    expect(host.preset.parameters.samplerOverrides).toMatchObject({ temperature: 0.75, topP: 0.95, minP: 0.05 });
    expect(host.preset.metadata.promptVariables).toEqual({ b1: { plan: 'b', risky: 1 } });
    expect(store.backups.p1!.sampler.temperature).toEqual({ had: true, value: 1 });
  });

  test('undo takes the same path and restores both', async () => {
    const host = new FakeHost();
    const editor = new FakeEditor(host);
    const store = emptyStore();
    const before = JSON.stringify(host.preset.parameters.samplerOverrides);
    await applyProfileViaEditor(host, store, profile(), { before: null, switchedTo: null }, editor.sampler as never);
    const r = await undoBackupViaEditor(host, store, 'p1', editor.sampler as never);
    expect(r.status).toBe('applied');
    expect(JSON.stringify(host.preset.parameters.samplerOverrides)).toBe(before);
    expect(JSON.stringify(editor.draft.samplerOverrides)).toBe(before);
    expect(host.preset.metadata.promptVariables).toEqual({ b1: { plan: 'a' } });
    expect(store.backups.p1).toBeUndefined();
  });

  test('sampler-only change through the editor still counts as applied and leaves a backup', async () => {
    const host = new FakeHost();
    const editor = new FakeEditor(host);
    const store = emptyStore();
    const r = await applyProfileViaEditor(host, store, profile({ variables: {} }), { before: null, switchedTo: null }, editor.sampler as never);
    expect(r.status).toBe('applied');
    expect(host.updates).toHaveLength(0);
    expect(store.backups.p1).toBeDefined();
  });

  test('same values again: noop, no host write, no new backup', async () => {
    const host = new FakeHost();
    const editor = new FakeEditor(host);
    const store = emptyStore();
    await applyProfileViaEditor(host, store, profile(), { before: null, switchedTo: null }, editor.sampler as never);
    delete store.backups.p1;
    host.updates.length = 0;
    const r = await applyProfileViaEditor(host, store, profile(), { before: null, switchedTo: null }, editor.sampler as never);
    expect(r.status).toBe('noop');
    expect(host.updates).toHaveLength(0);
    expect(store.backups.p1).toBeUndefined();
  });

  test('an editor failure aborts before anything is written to the host', async () => {
    const host = new FakeHost();
    const store = emptyStore();
    await expect(applyProfileViaEditor(host, store, profile(), { before: null, switchedTo: null }, async () => { throw new Error('closed'); })).rejects.toThrow('closed');
    expect(host.updates).toHaveLength(0);
    expect(store.backups.p1).toBeUndefined();
  });

  test('samplerPatch reports only what changed', () => {
    const r = samplerPatch({ temperature: 1, topP: 0.9 }, { set: { temperature: 1, topK: 5 }, remove: ['topP', 'nope'] });
    expect(r.next).toEqual({ temperature: 1, topK: 5 });
    expect(r.prev).toEqual({ topK: { had: false }, topP: { had: true, value: 0.9 } });
    expect(samplerPatch({ a: 1 }, { set: { a: 1 }, remove: [] }).changed).toBe(false);
  });
});

describe('variable shape check', () => {
  const opts = [{ id: 'a' }, { id: 'b' }];
  test('range needs two ordered numbers', () => {
    expect(() => checkVariableShape('range', [], [1, 5])).not.toThrow();
    expect(() => checkVariableShape('range', [], [5, 1])).toThrow();
    expect(() => checkVariableShape('range', [], [1])).toThrow();
    expect(() => checkVariableShape('range', [], 'x')).toThrow();
  });
  test('multiselect needs known option ids', () => {
    expect(() => checkVariableShape('multiselect', opts, ['a', 'b'])).not.toThrow();
    expect(() => checkVariableShape('multiselect', opts, [])).not.toThrow();
    expect(() => checkVariableShape('multiselect', opts, ['z'])).toThrow();
    expect(() => checkVariableShape('multiselect', opts, [1])).toThrow();
    expect(() => checkVariableShape('multiselect', opts, 'a')).toThrow();
  });
});
