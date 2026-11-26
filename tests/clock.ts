// Deterministic timer driver for the host's delayed storage write, without real sleeps.
export function installTestClock() {
  const originalSet = globalThis.setTimeout;
  const originalClear = globalThis.clearTimeout;
  let time = 0, nextId = 1;
  const pending = new Map<number, { at: number; callback: () => void }>();
  globalThis.setTimeout = ((callback: () => void, delay = 0) => {
    const id = nextId++;
    pending.set(id, { at: time + delay, callback });
    return id;
  }) as unknown as typeof setTimeout;
  globalThis.clearTimeout = ((id: number) => { pending.delete(Number(id)); }) as unknown as typeof clearTimeout;
  return {
    advance(ms: number) {
      const target = time + ms;
      while (true) {
        const next = [...pending].sort((a, b) => a[1].at - b[1].at).find(([, task]) => task.at <= target);
        if (!next) break;
        time = next[1].at; pending.delete(next[0]); next[1].callback();
      }
      time = target;
    },
    get pending() { return pending.size; },
    restore() { globalThis.setTimeout = originalSet; globalThis.clearTimeout = originalClear; },
  };
}
