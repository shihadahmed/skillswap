// Tiny in-memory TTL cache. Shields repeated reads from database/Atlas latency
// and keeps list endpoints snappy. Not shared across serverless instances, but
// a cache miss just falls through to the DB, so it's always safe.
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.exp < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.val;
}

function set(key, val, ttlMs = 20000) {
  store.set(key, { val, exp: Date.now() + ttlMs });
}

module.exports = { get, set };
