/** XP, levels and level-up rewards. Pure functions operating on a game-state draft. */
import { BALANCE, requiredXP } from '../data/gameBalance.js';

export { requiredXP };

/**
 * Add XP and process any number of level-ups. Each level-up grants BALANCE.levelUpReward
 * exactly once (guarded by the ledger key `levelup:<n>`).
 * @returns {number[]} the levels reached during this call
 */
export function addXP(state, amount) {
  const reached = [];
  if (!(amount > 0)) return reached;
  const p = state.player;
  p.xp += Math.round(amount);
  while (p.level < BALANCE.xp.maxLevel && p.xp >= requiredXP(p.level)) {
    p.xp -= requiredXP(p.level);
    p.level += 1;
    reached.push(p.level);
    const key = `levelup:${p.level}`;
    if (!state.ledger.processed[key]) {
      state.ledger.processed[key] = Date.now();
      p.coins += BALANCE.levelUpReward.coins;
      p.gems += BALANCE.levelUpReward.gems;
    }
  }
  return reached;
}

export function levelProgress(state) {
  const need = requiredXP(state.player.level);
  return { current: state.player.xp, need, ratio: Math.min(1, state.player.xp / need) };
}

/** Fame titles shown on the profile — purely cosmetic thresholds. */
export const FAME_TITLES = [
  [0, 'Aspiring Star'],
  [100, 'Local Favourite'],
  [500, 'Rising Starlet'],
  [1500, 'It Girl'],
  [4000, 'Celebrity'],
  [10000, 'Fashion Icon'],
  [25000, 'Glamour Legend'],
];
export function fameTitle(fame) {
  let t = FAME_TITLES[0][1];
  for (const [min, name] of FAME_TITLES) if (fame >= min) t = name;
  return t;
}
