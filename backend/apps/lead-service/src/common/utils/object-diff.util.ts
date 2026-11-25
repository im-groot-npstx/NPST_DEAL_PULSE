const IMMUTABLE_KEYS = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt']);

export function pickWritableLeadSnapshot(
  entity: Record<string, unknown>,
): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entity)) {
    if (IMMUTABLE_KEYS.has(key)) continue;
    if (key === 'qualification' || key === 'history') continue;
    if (value !== undefined) snapshot[key] = value;
  }
  return snapshot;
}

export function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { oldValue: Record<string, unknown>; newValue: Record<string, unknown> } {
  const oldValue: Record<string, unknown> = {};
  const newValue: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const prev = before[key];
    const next = after[key];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      oldValue[key] = prev ?? null;
      newValue[key] = next ?? null;
    }
  }
  return { oldValue, newValue };
}