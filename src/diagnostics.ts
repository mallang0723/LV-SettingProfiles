/** Log only the operation and error name/message, never stacks, causes, or attached request/preset objects. */
export function operationError(
  operation: 'apply' | 'auto_apply' | 'undo' | 'connection_switch' | 'backend_request',
  error: unknown,
): string {
  const name = error instanceof Error ? error.name : 'Error';
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Non-Error exception';
  const redact = (text: string) => text
    // JSON payloads can contain full presets or credentials; retain only the preceding diagnostic.
    .replace(/\{[\s\S]*|\[(?=\s*["{])[\s\S]*/g, '[data redacted]')
    .replace(/\b(?:https?|wss?):\/\/[^\s"'<>]+/gi, '[URL redacted]')
    .replace(/\b(?:Bearer|Basic)\s+[^\s,;"']+/gi, '[credentials redacted]')
    .replace(/\b(?:api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|token|secret|password|authorization|cookie)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '[credentials redacted]')
    .replace(/\bsk-[a-z0-9_-]+\b/gi, '[key redacted]')
    .replace(/\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\b/gi, '[token redacted]')
    .replace(/(?:\/home\/|\/Users\/)[^\s"']+/g, '[path redacted]')
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '[address redacted]')
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 500);
  return `[setting-profiles] ${operation}: ${redact(name)}: ${redact(message)}`;
}
