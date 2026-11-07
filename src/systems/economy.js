/**
 * ECONOMY — coins, gems and idempotent reward grants.
 *
 * All functions mutate a *draft* state passed in by the store's `transact`, so a
 * purchase (deduct + add item) is committed as one atomic state change and written
 * to IndexedDB as one record — an interrupted purchase can never half-apply.
 * Reward grants carry a transaction id stored in `state.ledger.processed`, so a
 * replayed claim (double tap, reload mid-claim, imported save) is ignored.
 */
import { addXP } from './progression.js';

export const priceCurrency = (price) => (price?.gems ? 'gems' : 'coins');
export const priceAmount = (price) => price?.gems ?? price?.coins ?? 0;

export function canAfford(state, price) {
  const cur = priceCurrency(price);
  return state.player[cur] >= priceAmount(price);
}

/** Deduct a price. Returns false (and changes nothing) if unaffordable or invalid. */
export function spend(state, price) {
  const cur = priceCurrency(price);
  const amt = priceAmount(price);
  if (!(amt >= 0) || !Number.isFinite(amt)) return false;
  if (state.player[cur] < amt) return false;
  state.player[cur] -= amt;
  state.stats[cur === 'coins' ? 'coinsSpent' : 'gemsSpent'] += amt;
  return true;
}

export function isProcessed(state, txId) {
  return !!state.ledger.processed[txId];
}

/**
 * Grant a reward once. reward: { coins, gems, xp, fame }.
 * @returns {{ok:boolean, levels:number[]}}
 */
export function grant(state, reward, txId) {
  if (txId && isProcessed(state, txId)) return { ok: false, reason: 'already-claimed', levels: [] };
  const p = state.player;
  if (reward.coins) { p.coins += reward.coins; state.stats.coinsEarned += reward.coins; }
  if (reward.gems) { p.gems += reward.gems; state.stats.gemsEarned += reward.gems; }
  if (reward.fame) p.fame += reward.fame;
  const levels = reward.xp ? addXP(state, reward.xp) : [];
  if (txId) state.ledger.processed[txId] = Date.now();
  return { ok: true, levels };
}

/** Resale value for an item (Milestone 6 uses this; defined now for balance tests). */
export function resaleValue(price, rate) {
  return Math.floor(priceAmount(price) * rate);
}
