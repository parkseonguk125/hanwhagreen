const store = new Map();

const DEFAULT_TTL_MS = Number(process.env.LIVE_DATA_CACHE_MS) || 600_000;

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function getCacheStats() {
  const now = Date.now();
  const keys = [];
  for (const [key, entry] of store.entries()) {
    keys.push({
      key,
      expiresInMs: Math.max(0, entry.expiresAt - now),
    });
  }
  return keys;
}
