// In-memory preset host used by unit tests and the browser harness. Revision rules follow the real host:
// a write must carry expected_cache_revision, a stale one throws a PRESET_REVISION_CONFLICT error.
import type { PresetHost, PresetLike, UpdatePayload } from '../src/core';

export const syntheticBlocks = () => [
  { id: 'b1', name: 'Planning', content: 'SYNTHETIC BLOCK TEXT', enabled: true, variables: [
    { id: 'v1', name: 'plan', label: 'Plan', type: 'select', defaultValue: 'a', options: [{ id: 'a', label: 'Scene plan' }, { id: 'b', label: 'None' }] },
    { id: 'v2', name: 'risky', label: 'Risky mode', type: 'switch', defaultValue: 0 },
    { id: 'v3', name: 'note', label: 'Note', type: 'textarea', defaultValue: '' },
  ] },
  { id: 'b2', name: 'Plain', content: 'x', enabled: false },
];

export const syntheticPreset = (): PresetLike => ({
  id: 'p1', name: 'Synthetic Preset', cache_revision: 7,
  parameters: { samplerOverrides: { enabled: true, temperature: 1, topP: 0.9, topK: 40, maxTokens: null }, customBody: { enabled: false, rawJson: '{}' } },
  metadata: { promptVariables: { b1: { plan: 'a' } }, description: 'keep me' },
  prompt_order: syntheticBlocks(),
});

export class FakeHost implements PresetHost {
  preset = syntheticPreset();
  updates: UpdatePayload[] = [];
  bumpBeforeUpdate = 0;
  async get(id: string) { return id === this.preset.id ? (JSON.parse(JSON.stringify(this.preset)) as PresetLike) : null; }
  async update(_id: string, input: UpdatePayload) {
    this.updates.push(JSON.parse(JSON.stringify(input)));
    if (this.bumpBeforeUpdate > 0) { this.bumpBeforeUpdate--; this.preset.cache_revision! += 1; }
    if (input.expected_cache_revision !== this.preset.cache_revision) {
      throw Object.assign(new Error('conflict'), { code: 'PRESET_REVISION_CONFLICT', expectedCacheRevision: input.expected_cache_revision, actualCacheRevision: this.preset.cache_revision });
    }
    if (input.parameters) this.preset.parameters = input.parameters;
    if (input.metadata) this.preset.metadata = input.metadata;
    this.preset.cache_revision! += 1;
    return JSON.parse(JSON.stringify(this.preset)) as PresetLike;
  }
}
