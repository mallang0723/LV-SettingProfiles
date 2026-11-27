import { expect, test } from 'bun:test';
import { operationError } from '../src/diagnostics';

test('diagnostics preserve operation, error name and useful message without attached data or stack', () => {
  const error = Object.assign(new TypeError('Preset update refused: revision mismatch'), {
    apiKey: 'synthetic-attached-key', preset: { prompt_order: ['synthetic-private-prompt'] },
    cause: 'synthetic-private-cause', stack: 'synthetic-private-stack',
  });
  expect(operationError('apply', error)).toBe('[setting-profiles] apply: TypeError: Preset update refused: revision mismatch');
  expect(operationError('undo', { preset: 'synthetic-private-prompt' })).toBe('[setting-profiles] undo: Error: Non-Error exception');
});

test('diagnostics redact credentials and embedded payloads from error messages', () => {
  const cases = [
    'Unauthorized: Bearer synthetic-secret',
    'Rejected: apiKey=synthetic-secret',
    'Rejected: password="synthetic-secret with spaces"',
    'Rejected: access_token=synthetic-secret',
    'Rejected: https://example.invalid/?key=synthetic-secret',
    'Rejected: sk-synthetic-secret',
    'Update failed: {"prompt_order":["synthetic-secret"]}',
  ];
  for (const text of cases) {
    const log = operationError('connection_switch', new Error(text));
    expect(log).toContain('[setting-profiles] connection_switch: Error:');
    expect(log).not.toContain('synthetic-secret');
    expect(log).toContain('redacted');
  }
});
