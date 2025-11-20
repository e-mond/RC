// src/mocks/_utils.js
/**
 * Mock utilities
 * - withDelay: resolves a value after a timeout (used to simulate network latency)
 * - genId: simple unique id generator (prefixed)
 * - nowISO: ISO string for "createdAt" timestamps
 *
 * These helpers keep behavior deterministic and are safe for dev use.
 */

let _counter = 1;

export const genId = (prefix = "m") => {
  // Keep unique-ish IDs per dev session
  return `${prefix}_${Date.now().toString(36)}_${_counter++}`;
};

export const nowISO = () => new Date().toISOString();

/**
 * Wrap a value or promise and resolve it after ms milliseconds.
 * Accepts:
 *  - value (object/array/primitive)
 *  - function that returns a value (we'll call it)
 *  - a Promise (we will await it)
 *
 * Returns a Promise that resolves after the given delay.
 */
export const withDelay = async (valueOrFn, ms = 600) => {
  const run = async () => {
    if (typeof valueOrFn === "function") {
      return valueOrFn();
    }
    // valueOrFn may be a Promise or raw value
    return valueOrFn;
  };

  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const val = await run();
        // clone for safety to avoid accidental external mutation
        if (val && typeof val === "object") {
          resolve(JSON.parse(JSON.stringify(val)));
        } else {
          resolve(val);
        }
      } catch (err) {
        // resolve with error object so consumers can decide what to do
        resolve(Promise.reject(err));
      }
    }, ms);
  });
};
