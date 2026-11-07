/**
 * One shared 1-second clock for every countdown on screen (job timers, quest resets).
 * Screens subscribe on mount and unsubscribe in their cleanup function.
 */
const subs = new Set();
let timer = null;

export const ticker = {
  subscribe(fn) {
    subs.add(fn);
    if (!timer) timer = setInterval(() => { const now = Date.now(); subs.forEach((f) => f(now)); }, 1000);
    return () => { subs.delete(fn); };
  },
};
