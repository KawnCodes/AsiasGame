/**
 * COMPETITION SYSTEM — themed fashion contests at the Grand Pavilion.
 *
 * scoreLook(look, theme) rates a look 0..10 in eight categories:
 *   theme · coordination · colour harmony · hairstyle · makeup · accessories · rarity · creativity
 * Three NPC judges weight those categories differently (data/competitions.js) and each gives
 * a 1–10 score; a contestant's total is the sum (max 30). Rivals are generated from the
 * full catalogue with a tier-dependent "skill" and scored by exactly the same function, so
 * the player always competes on equal terms.
 *
 * Everything random is seeded from the contest uid, so a contest's rivals and judge
 * scores are reproducible (tests, and future online verification).
 */
import { BALANCE } from '../data/gameBalance.js';
import { THEMES, THEME_BY_ID, JUDGES, JUDGE_LINES, RIVAL_NAMES, CATEGORIES } from '../data/competitions.js';
import { CLOTHING, CLOTHING_BY_ID, RARITIES } from '../data/clothing.js';
import { SKIN_TONES, FACE_SHAPES, EYE_SHAPES, EYE_COLORS, BROWS, NOSES, LIPS, HAIRSTYLES, HAIRSTYLE, HAIR_COLORS, MAKEUP, MAKEUP_BY_ID, DEFAULT_APPEARANCE } from '../data/appearance.js';
import { hexToRgb } from '../utils/color.js';
import { seededRandom, dateKey } from '../utils/time.js';
import { grant } from './economy.js';
import { recordEvent } from './questSystem.js';
import { perks } from './propertySystem.js';

export const CATEGORY_IDS = Object.keys(CATEGORIES);
const CORE = ['top', 'bottom', 'dress', 'outerwear', 'shoes'];
const ACCESSORY_SLOTS = ['bag', 'earrings', 'necklace', 'bracelet', 'hairAcc'];
const MAKEUP_KEYS = ['eyeshadow', 'eyeliner', 'lipstick', 'blush'];

// ------------------------------------------------------------------ helpers
export function emptyContests() {
  return { board: [], history: [], entries: 0, wins: 0, podiums: 0, galaWins: 0, bestPercent: 0, lastSignature: null, judge: { dayKey: null, paid: 0, round: null } };
}

/** How well a set of style tags fits a theme, 0..1. */
export function tagFit(styles = [], theme) {
  let sum = 0;
  for (const t of styles) sum += theme.styles[t] || 0;
  return Math.min(1, sum * 0.75);
}

function colourDistance(a, b) {
  const A = hexToRgb(a); const B = hexToRgb(b);
  return Math.sqrt(((A.r - B.r) / 255) ** 2 + ((A.g - B.g) / 255) ** 2 + ((A.b - B.b) / 255) ** 2) / Math.sqrt(3);
}

function hsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = r / 255; const G = g / 255; const B = b / 255;
  const max = Math.max(R, G, B); const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0));
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: h * 60, s, l };
}

const isNeutral = (hex) => { const c = hsl(hex); return c.s < 0.2 || c.l > 0.93 || c.l < 0.14; };

/** Resolve a look's worn items (a dress hides top & bottom, as on the avatar). */
export function wornItems(equipped = {}) {
  const eq = {};
  for (const [slot, id] of Object.entries(equipped)) if (id && CLOTHING_BY_ID[id]) eq[slot] = CLOTHING_BY_ID[id];
  if (eq.dress) { delete eq.top; delete eq.bottom; }
  return eq;
}

/** A compact fingerprint of an outfit — used to discourage re-entering the identical look. */
export function lookSignature(look) {
  const eq = wornItems(look.equipped);
  return Object.keys(eq).sort().map((k) => eq[k].id).join('|') + `#${look.appearance?.hairStyle}`;
}

// ------------------------------------------------------------------ scoring
/**
 * Score a look against a theme. Returns { categories: {id: 0..10}, notes: {...} }.
 * look = { appearance, equipped }, opts.lastSignature penalises repeating your last entry.
 */
export function scoreLook(look, theme, opts = {}) {
  const ap = { ...DEFAULT_APPEARANCE, ...look.appearance };
  const eq = wornItems(look.equipped);
  const items = Object.values(eq);
  const hasBase = !!eq.dress || (!!eq.top && !!eq.bottom);
  const cat = {};

  // THEME — how on-brief the clothing is (dress counts double; full looks favoured where asked)
  const core = CORE.filter((s) => eq[s]).map((s) => eq[s]);
  let tw = 0; let ts = 0;
  for (const it of core) { const w = it.slot === 'dress' ? 2 : 1; tw += w; ts += w * tagFit(it.styles, theme); }
  let themeScore = tw ? (ts / tw) * 10 : 0;
  if (!hasBase) themeScore *= 0.4;
  if (!eq.shoes) themeScore -= 1.5;
  if (theme.preferDress && hasBase && !eq.dress) themeScore -= 1;
  cat.theme = themeScore;

  // COORDINATION — a dominant shared style + a complete outfit
  const tagCount = {};
  for (const it of items) for (const t of new Set(it.styles)) tagCount[t] = (tagCount[t] || 0) + 1;
  const dominant = items.length ? Math.max(0, ...Object.values(tagCount)) / items.length : 0;
  const accessories = ACCESSORY_SLOTS.filter((s) => eq[s]).map((s) => eq[s]);
  const completeness = ((hasBase ? 1 : 0) + (eq.shoes ? 1 : 0) + Math.min(accessories.length, 2) / 2) / 3;
  cat.coordination = 10 * (0.55 * dominant + 0.45 * completeness);

  // COLOUR — closeness to the theme palette + a harmonious number of hues
  const colours = items.map((it) => it.color);
  let paletteMatch = 0;
  for (const c of colours) {
    const d = Math.min(...theme.palette.map((p) => colourDistance(c, p)));
    paletteMatch += Math.max(0, 1 - d / 0.45);
  }
  paletteMatch = colours.length ? paletteMatch / colours.length : 0;
  const hueBins = new Set(colours.filter((c) => !isNeutral(c)).map((c) => Math.floor(((hsl(c).h + 15) % 360) / 30)));
  const harmony = hueBins.size <= 2 ? 1 : hueBins.size === 3 ? 0.75 : 0.5;
  cat.colour = colours.length ? 10 * (0.6 * paletteMatch + 0.4 * harmony) : 0;

  // HAIR — style tags + theme hair colours
  const hs = HAIRSTYLE[ap.hairStyle];
  let hair = 0.3 + 0.7 * tagFit(hs?.styles, theme);
  if (theme.hairColors?.includes(ap.hairColor)) hair += 0.2;
  cat.hair = Math.min(10, hair * 10);

  // MAKEUP — wearing makeup, products that suit the theme, and signature products
  const products = MAKEUP_KEYS.map((k) => MAKEUP_BY_ID[ap[k]]).filter((m) => m && (m.color || (m.style && m.style !== 'none')));
  const matchAvg = products.length ? products.reduce((n, m) => n + (m.styles ? 0.3 + 0.7 * tagFit(m.styles, theme) : 0.3), 0) / products.length : 0;
  const signature = MAKEUP_KEYS.some((k) => theme.makeup?.includes(ap[k])) ? 0.25 : 0;
  cat.makeup = 10 * Math.min(1, 0.4 * (products.length / 4) + 0.45 * matchAvg + signature);

  // ACCESSORIES — how many, and how on-theme
  const accQ = accessories.length ? accessories.reduce((n, a) => n + tagFit(a.styles, theme), 0) / accessories.length : 0;
  cat.accessories = 10 * Math.min(1, 0.12 * accessories.length + (accessories.length ? 0.5 * accQ : 0));

  // RARITY — average rarity of the worn pieces
  const avgR = items.length ? items.reduce((n, it) => n + (RARITIES[it.rarity]?.score || 1), 0) / items.length : 1;
  cat.rarity = items.length ? 2 + ((avgR - 1) / 3) * 8 : 0;

  // CREATIVITY — breadth of styles, patterns & finishes; repeating your last entry costs points
  const distinct = Object.keys(tagCount).length;
  const flair = items.filter((it) => (it.pattern && it.pattern !== 'solid') || it.finish).length;
  let creativity = 10 * (0.6 * Math.min(1, distinct / 8) + 0.4 * Math.min(1, flair / 3));
  if (opts.lastSignature && opts.lastSignature === lookSignature(look)) creativity -= 3;
  cat.creativity = creativity;

  for (const k of CATEGORY_IDS) cat[k] = Math.round(Math.max(0, Math.min(10, cat[k])) * 10) / 10;
  return { categories: cat, hasBase, hasShoes: !!eq.shoes };
}

/** Each judge turns category scores into a 1–10 score (±0.3 seeded jitter) plus a comment. */
export function judgeLook(scored, rnd) {
  const used = new Set(); // each judge remarks on a different category, so comments never repeat
  return JUDGES.map((j) => {
    let w = 0; let s = 0;
    for (const [k, weight] of Object.entries(j.weights)) { w += weight; s += weight * scored.categories[k]; }
    const jitter = (rnd() - 0.5) * 0.6;
    const score = Math.round(Math.max(1, Math.min(10, s / w + jitter)) * 10) / 10;
    // talk about the best (or weakest) category, biased toward what this judge cares about
    const good = score >= 6;
    const ranked = CATEGORY_IDS
      .map((k) => [k, (good ? scored.categories[k] : 10 - scored.categories[k]) * (1 + (j.weights[k] || 0) / 4)])
      .sort((a, b) => b[1] - a[1]);
    const key = (ranked.find(([k]) => !used.has(k)) || ranked[0])[0];
    used.add(key);
    const lines = JUDGE_LINES[good ? 'good' : 'bad'][key];
    return { judge: j.id, score, comment: lines[Math.floor(rnd() * lines.length)], focus: key };
  });
}

// ------------------------------------------------------------------ rivals
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

function choose(candidates, theme, skill, rnd, fitFn) {
  if (!candidates.length) return null;
  if (rnd() < skill) {
    const ranked = candidates.map((c) => [fitFn(c) + rnd() * 0.15, c]).sort((a, b) => b[0] - a[0]);
    return ranked[Math.floor(rnd() * Math.max(1, Math.ceil(ranked.length * 0.2)))][1];
  }
  return pick(candidates, rnd);
}

/** Build a rival's whole look from the catalogue. Higher skill → more on-theme choices. */
export function generateRival(theme, skill, rnd, name) {
  const fit = (it) => tagFit(it.styles, theme) + (it.color ? Math.max(0, 1 - Math.min(...theme.palette.map((p) => colourDistance(it.color, p))) / 0.45) * 0.4 : 0);
  const bySlot = (slot) => CLOTHING.filter((c) => c.slot === slot);
  const equipped = {};
  const wantDress = theme.preferDress ? rnd() < 0.5 + skill * 0.5 : rnd() < 0.4;
  if (wantDress) equipped.dress = choose(bySlot('dress'), theme, skill, rnd, fit)?.id;
  else {
    equipped.top = choose(bySlot('top'), theme, skill, rnd, fit)?.id;
    equipped.bottom = choose(bySlot('bottom'), theme, skill, rnd, fit)?.id;
  }
  if (rnd() < 0.85) equipped.shoes = choose(bySlot('shoes'), theme, skill, rnd, fit)?.id;
  if (rnd() < 0.25 + skill * 0.3) equipped.outerwear = choose(bySlot('outerwear'), theme, skill, rnd, fit)?.id;
  const nAcc = Math.round(skill * 4 + rnd() * 1.5);
  const accSlots = [...ACCESSORY_SLOTS].sort(() => rnd() - 0.5).slice(0, nAcc);
  for (const s of accSlots) equipped[s] = choose(bySlot(s), theme, skill, rnd, fit)?.id;

  const hairFit = (h) => tagFit(h.styles, theme);
  const makeupFor = (kind) => {
    const list = MAKEUP.filter((m) => m.kind === kind);
    if (rnd() < skill) {
      const sig = list.filter((m) => theme.makeup?.includes(m.id));
      if (sig.length && rnd() < 0.6) return pick(sig, rnd).id;
      return choose(list.filter((m) => m.color || m.style !== 'none'), theme, 1, rnd, (m) => tagFit(m.styles, theme)).id;
    }
    return pick(list, rnd).id;
  };
  const appearance = {
    skin: pick(SKIN_TONES, rnd).id, face: pick(FACE_SHAPES, rnd).id, eyes: pick(EYE_SHAPES, rnd).id, eyeColor: pick(EYE_COLORS, rnd).id,
    brows: pick(BROWS, rnd).id, nose: pick(NOSES, rnd).id, lips: pick(LIPS, rnd).id,
    hairStyle: choose(HAIRSTYLES, theme, skill, rnd, hairFit).id,
    hairColor: theme.hairColors && rnd() < skill ? pick(theme.hairColors, rnd) : pick(HAIR_COLORS, rnd).id,
    eyeshadow: makeupFor('eyeshadow'), eyeliner: makeupFor('eyeliner'), lipstick: makeupFor('lipstick'), blush: makeupFor('blush'),
  };
  return { name, appearance, equipped };
}

// ------------------------------------------------------------------ board
export const tierAvailable = (state, tierId) => state.player.level >= BALANCE.contests.tiers[tierId].minLevel;
export const spotlightTheme = (now = Date.now()) => THEMES[Math.floor(seededRandom(`spotlight:${dateKey(now)}`)() * THEMES.length)].id;

function newContest(state, themeId, rnd, now) {
  const tiers = Object.keys(BALANCE.contests.tiers).filter((t) => tierAvailable(state, t));
  // favour the highest unlocked tier, but keep easier contests around
  const tier = tiers.length > 1 && rnd() < 0.5 ? tiers[tiers.length - 1] : pick(tiers, rnd);
  return { uid: `c${now.toString(36)}${Math.floor(rnd() * 1e9).toString(36)}`, theme: themeId, tier };
}

/** Fill the board to boardSize with distinct themes; the theme of the day is always offered. */
export function ensureBoard(state, now = Date.now()) {
  if (!state.contests) state.contests = emptyContests();
  const c = state.contests;
  const rnd = seededRandom(`board:${now}:${c.entries}:${c.board.length}`);
  let changed = false;
  // drop contests whose tier isn't available (e.g. imported saves) — never happens in normal play
  c.board = c.board.filter((b) => THEME_BY_ID[b.theme] && BALANCE.contests.tiers[b.tier]);
  const spot = spotlightTheme(now);
  if (!c.board.some((b) => b.theme === spot)) { c.board.unshift(newContest(state, spot, rnd, now)); changed = true; }
  while (c.board.length < BALANCE.contests.boardSize) {
    const used = new Set(c.board.map((b) => b.theme));
    const options = THEMES.filter((t) => !used.has(t.id));
    c.board.push(newContest(state, pick(options, rnd).id, rnd, now));
    changed = true;
  }
  if (c.board.length > BALANCE.contests.boardSize) { c.board = c.board.slice(0, BALANCE.contests.boardSize); changed = true; }
  return changed;
}

/** Prize for a finishing place in a contest (before spotlight bonus). */
export function prizeFor(place, tierId, spotlight = false) {
  const p = BALANCE.contests.prizes[place] || BALANCE.contests.prizes.entry;
  const m = BALANCE.contests.tiers[tierId].mult;
  const coins = Math.round(p.coins * m * (spotlight ? 1 + BALANCE.contests.spotlightBonus : 1));
  return { coins, gems: Math.round(p.gems * m), xp: Math.round(p.xp * m), fame: Math.round(p.fame * m) };
}

export function canEnter(look) {
  const eq = wornItems(look.equipped);
  if (!(eq.dress || (eq.top && eq.bottom))) return { ok: false, reason: 'no-outfit', message: 'Wear a dress, or a top with a bottom, before walking the runway!' };
  return { ok: true };
}

/**
 * Enter a contest from the board with the player's current look. Generates rivals,
 * judges everyone, ranks, pays prizes (ledger: contest:<uid>), records a trophy,
 * replaces the board slot and returns the full result for the presentation.
 */
export function submitEntry(state, contestUid, now = Date.now()) {
  ensureBoard(state, now);
  const c = state.contests;
  const idx = c.board.findIndex((b) => b.uid === contestUid);
  if (idx < 0) return { ok: false, reason: 'unknown-contest' };
  const contest = c.board[idx];
  const theme = THEME_BY_ID[contest.theme];
  const tier = BALANCE.contests.tiers[contest.tier];
  if (!tierAvailable(state, contest.tier)) return { ok: false, reason: 'locked' };
  const playerLook = { appearance: { ...state.appearance }, equipped: { ...state.equipped } };
  const gate = canEnter(playerLook);
  if (!gate.ok) return gate;

  const rnd = seededRandom(`contest:${contest.uid}`);
  const names = [...RIVAL_NAMES].sort(() => rnd() - 0.5);
  const contestants = [{ id: 'player', name: state.player.name, isPlayer: true, look: playerLook }];
  for (let i = 0; i < tier.rivals; i++) {
    const skill = tier.skill[0] + rnd() * (tier.skill[1] - tier.skill[0]);
    const rival = generateRival(theme, skill, rnd, names[i]);
    contestants.push({ id: `r${i}`, name: rival.name, isPlayer: false, look: { appearance: rival.appearance, equipped: rival.equipped } });
  }
  for (const ct of contestants) {
    ct.scored = scoreLook(ct.look, theme, ct.isPlayer ? { lastSignature: c.lastSignature } : {});
    ct.judges = judgeLook(ct.scored, rnd);
    ct.total = Math.round(ct.judges.reduce((n, j) => n + j.score, 0) * 10) / 10;
  }
  // rank: higher total first; the player wins exact ties (home-crowd advantage)
  const ranked = [...contestants].sort((a, b) => (b.total - a.total) || (a.isPlayer ? -1 : b.isPlayer ? 1 : 0));
  ranked.forEach((ct, i) => { ct.place = i + 1; });
  const me = contestants[0];
  const spotlight = contest.theme === spotlightTheme(now);
  const reward = prizeFor(me.place, contest.tier, spotlight);
  const vanity = perks(state).contestCoins; // Luxury Vanity upgrade
  if (vanity) reward.coins = Math.round(reward.coins * (1 + vanity));
  const g = grant(state, reward, `contest:${contest.uid}`);
  if (!g.ok) return { ok: false, reason: 'already-entered' };

  const percent = Math.round((me.total / 30) * 100);
  c.entries += 1;
  if (me.place === 1) { c.wins += 1; if (contest.tier === 'gala') c.galaWins += 1; }
  if (me.place <= 3) c.podiums += 1;
  c.bestPercent = Math.max(c.bestPercent, percent);
  c.lastSignature = lookSignature(playerLook);
  const summary = { uid: contest.uid, theme: contest.theme, tier: contest.tier, place: me.place, of: contestants.length, total: me.total, percent, at: now, spotlight };
  c.history = [summary, ...c.history].slice(0, 30);
  if (me.place <= 3) {
    state.trophies = [...(state.trophies || []), { id: contest.uid, theme: contest.theme, tier: contest.tier, place: me.place, at: now }];
  }
  c.board.splice(idx, 1);
  ensureBoard(state, now + 1);
  recordEvent(state, 'contest', { place: me.place, tier: contest.tier, theme: contest.theme }, now);

  return { ok: true, contest, theme, tierInfo: tier, spotlight, contestants, ranked, me, reward, levels: g.levels, percent };
}

// ------------------------------------------------------------------ guest judge
/** Start (or reuse) a guest-judging round: two rival looks for a theme; pick the winner. */
export function ensureJudgeRound(state, now = Date.now()) {
  if (!state.contests) state.contests = emptyContests();
  const j = state.contests.judge;
  if (j.dayKey !== dateKey(now)) { j.dayKey = dateKey(now); j.paid = 0; }
  if (j.round) return j.round;
  const uid = `j${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const rnd = seededRandom(uid);
  const theme = pick(THEMES, rnd);
  const names = [...RIVAL_NAMES].sort(() => rnd() - 0.5);
  // one strong and one weak look so a careful eye can tell them apart
  const looks = [generateRival(theme, 0.75 + rnd() * 0.2, rnd, names[0]), generateRival(theme, rnd() * 0.3, rnd, names[1])];
  if (rnd() < 0.5) looks.reverse();
  const totals = looks.map((l) => { const s = scoreLook(l, theme); return judgeLook(s, rnd).reduce((n, x) => n + x.score, 0); });
  j.round = { uid, theme: theme.id, looks, totals: totals.map((t) => Math.round(t * 10) / 10) };
  return j.round;
}

export function answerJudgeRound(state, choice, now = Date.now()) {
  const round = ensureJudgeRound(state, now);
  const j = state.contests.judge;
  const correctIdx = round.totals[0] >= round.totals[1] ? 0 : 1;
  const correct = choice === correctIdx;
  let reward = null;
  let levels = [];
  if (correct && j.paid < BALANCE.contests.guestJudge.paidRoundsPerDay) {
    const r = grant(state, { coins: BALANCE.contests.guestJudge.coins, xp: BALANCE.contests.guestJudge.xp }, `judge:${round.uid}`);
    if (r.ok) { j.paid += 1; reward = { coins: BALANCE.contests.guestJudge.coins, xp: BALANCE.contests.guestJudge.xp }; levels = r.levels; }
  }
  j.round = null;
  return { ok: true, correct, correctIdx, totals: round.totals, reward, levels, paidLeft: BALANCE.contests.guestJudge.paidRoundsPerDay - j.paid };
}
