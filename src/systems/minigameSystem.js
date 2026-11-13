/**
 * MINIGAME REWARDS — every finished game pays (no cooldowns); better results pay more.
 * Each play has a unique id so a reward can never be claimed twice (ledger `minigame:<uid>`).
 * state.minigames = { played, best: { memory_easy: score, match3: score, styling: percent } }
 */
import { BALANCE } from '../data/gameBalance.js';
import { MEMORY_LEVELS } from '../minigames/memory.js';
import { grant } from './economy.js';
import { recordEvent } from './questSystem.js';

export function emptyMinigames() {
  return { played: 0, wins: 0, best: {} };
}

/**
 * result = { game: 'memory'|'match3'|'styling', uid, level?, score, stars, finished }
 * finished=false (Match-3 out of moves, 0-star styling) still pays BALANCE.minigames.unfinishedFactor.
 */
export function minigameReward(result) {
  const M = BALANCE.minigames;
  let mult = result.finished ? 1 : M.unfinishedFactor;
  if (result.game === 'memory') mult *= MEMORY_LEVELS[result.level]?.mult || 1;
  mult *= 1 + (M.starBonus[result.stars] || 0);
  return { coins: Math.round(M.reward.coins * mult), xp: Math.round(M.reward.xp * mult) };
}

export function claimMinigame(state, result) {
  if (!result?.uid) return { ok: false, reason: 'bad-result' };
  if (!state.minigames) state.minigames = emptyMinigames();
  const reward = minigameReward(result);
  const g = grant(state, reward, `minigame:${result.uid}`);
  if (!g.ok) return { ok: false, reason: 'already-claimed' };
  const m = state.minigames;
  m.played += 1;
  if (result.finished) m.wins += 1;
  const bestKey = result.game === 'memory' ? `memory_${result.level}` : result.game;
  const isBest = result.score > (m.best[bestKey] || 0);
  if (isBest) m.best[bestKey] = result.score;
  recordEvent(state, 'minigame', { game: result.game, won: !!result.finished });
  return { ok: true, reward, levels: g.levels, best: isBest };
}
