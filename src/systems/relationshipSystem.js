/**
 * RELATIONSHIPS & SOCIAL — meeting people, conversations, flirting, gifts, dates,
 * becoming partners, phone messages, home visits and parties.
 *
 * state.social = {
 *   rel: { [id]: { met, points, dates, day, chats, flirts, gifts, dated, visited, homeVisited, storiesSeen: [] } },
 *   partner: id | null,
 *   messages: [{ id, from, text, at, read, replies?: [{t, v}], replied? }], msgSeq,
 *   hosting: { day, guests: [] }, parties, lastTextDay
 * }
 * Points follow each character's taste: every dialogue choice has a vibe, and characters
 * like different vibes. Daily caps keep progress fair without any waiting timers — you
 * can keep chatting, it just stops earning points until tomorrow.
 */
import { BALANCE } from '../data/gameBalance.js';
import { CHARACTERS, CHARACTER_BY_ID, ROMANCE_LEVELS, FRIEND_LEVELS, SMALL_TALK } from '../data/characters.js';
import { VENUE_BY_ID } from '../data/venues.js';
import { GIFT_BY_ID } from '../data/gifts.js';
import { CLOTHING_BY_ID } from '../data/clothing.js';
import { dateKey, seededRandom } from '../utils/time.js';
import { canAfford, spend, grant } from './economy.js';
import { recordEvent } from './questSystem.js';

const B = () => BALANCE.social;

export function emptySocial() {
  return { rel: {}, partner: null, messages: [], msgSeq: 1, hosting: { day: null, guests: [] }, parties: 0, lastTextDay: null };
}

const levelsFor = (c) => (c.kind === 'romance' ? ROMANCE_LEVELS : FRIEND_LEVELS);

export function levelInfo(char, points) {
  const L = levelsFor(char);
  let i = 0;
  for (let k = 0; k < L.length; k++) if (points >= L[k].min) i = k;
  const next = L[i + 1] || null;
  return { index: i, name: L[i].name, min: L[i].min, next, ratio: next ? (points - L[i].min) / (next.min - L[i].min) : 1 };
}

/** Relationship record with daily counters rolled over to `now`'s calendar day. */
export function rel(state, id, now = Date.now()) {
  if (!state.social) state.social = emptySocial();
  const r = (state.social.rel[id] ||= { met: false, points: 0, dates: 0, day: null, chats: 0, flirts: 0, gifts: 0, dated: false, visited: false, homeVisited: false, storiesSeen: [] });
  const dk = dateKey(now);
  if (r.day !== dk) Object.assign(r, { day: dk, chats: 0, flirts: 0, gifts: 0, dated: false, visited: false, homeVisited: false });
  return r;
}

export const levelOf = (state, id) => levelInfo(CHARACTER_BY_ID[id], state.social?.rel?.[id]?.points || 0);
export const isPartner = (state, id) => state.social?.partner === id;

/** Add (or remove) relationship points, respecting the "partners only past Close" cap. */
function addPoints(state, id, pts) {
  const c = CHARACTER_BY_ID[id];
  const r = state.social.rel[id];
  const before = levelInfo(c, r.points).index;
  let next = Math.max(0, r.points + pts);
  if (c.kind === 'romance' && !isPartner(state, id)) next = Math.min(next, B().unpartneredCap);
  r.points = next;
  const after = levelInfo(c, r.points).index;
  return { gained: pts, levelUp: after > before ? levelsFor(c)[after].name : null, level: after };
}

/** Story scenes reached but not yet shown. */
export function pendingStories(state, id) {
  const c = CHARACTER_BY_ID[id];
  const r = state.social?.rel?.[id];
  if (!c || !r) return [];
  const lvl = levelInfo(c, r.points).index;
  return Object.entries(c.story || {}).filter(([k]) => Number(k) <= lvl && !r.storiesSeen.includes(Number(k))).map(([k, v]) => ({ level: Number(k), ...v }));
}
export function markStorySeen(state, id, level) {
  const r = state.social.rel[id];
  if (!r.storiesSeen.includes(level)) r.storiesSeen.push(level);
  return { ok: true };
}

// ------------------------------------------------------------------ presence & meeting
/** Who's at a venue today: always at their home spot; at their other haunts on some days. */
export function presentAt(venueId, now = Date.now()) {
  const dk = dateKey(now);
  return CHARACTERS.filter((c) => c.home === venueId || (c.also.includes(venueId) && seededRandom(`${c.id}:${venueId}:${dk}`)() < 0.6)).map((c) => c.id);
}

export function meet(state, id, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  if (!c) return { ok: false, reason: 'unknown' };
  const r = rel(state, id, now);
  if (r.met) return { ok: false, reason: 'already-met' };
  r.met = true;
  addPoints(state, id, B().meetPoints);
  pushMessage(state, id, c.kind === 'romance' ? 'Really nice meeting you today 😊' : 'Yay, new friend!! Saving your number 💕', now);
  recordEvent(state, 'meet', { id }, now);
  return { ok: true };
}

export const metIds = (state) => Object.entries(state.social?.rel || {}).filter(([, r]) => r.met).map(([id]) => id);

// ------------------------------------------------------------------ conversation
const vibeScore = (c, v) => Math.max(-2, Math.min(2, c.vibes[v] ?? 0));
const grade = (score) => (score >= 2 ? 'great' : score >= 0 ? 'ok' : 'bad');

/** A conversation topic: personal ones first (rotating), then small talk. */
export function nextTopic(state, id, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  const r = rel(state, id, now);
  const pool = [...c.topics, ...SMALL_TALK];
  const n = (r.topicIdx || 0) % pool.length;
  return { ...pool[n], index: n, personal: n < c.topics.length };
}

function reactionFor(c, choice, g, rnd = Math.random) {
  if (choice.r && g !== 'bad') return choice.r;
  if (choice.r && g === 'bad') return choice.r;
  const lines = c.reactions[g];
  return lines[Math.floor(rnd() * lines.length)];
}

export function chat(state, id, choiceIndex, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  const r = rel(state, id, now);
  if (!r.met) return { ok: false, reason: 'not-met' };
  const topic = nextTopic(state, id, now);
  const choice = topic.choices[choiceIndex];
  if (!choice) return { ok: false, reason: 'bad-choice' };
  const score = vibeScore(c, choice.v);
  const counts = r.chats < B().dailyCaps.chats;
  r.chats += 1;
  r.topicIdx = (r.topicIdx || 0) + 1;
  const res = counts ? addPoints(state, id, B().vibePoints[score]) : { gained: 0, levelUp: null };
  recordEvent(state, 'chat', { id }, now);
  return { ok: true, grade: grade(score), reaction: reactionFor(c, choice, grade(score)), ...res, capped: !counts };
}

export function canFlirt(state, id) {
  const c = CHARACTER_BY_ID[id];
  return c?.kind === 'romance' && levelOf(state, id).index >= B().flirtNeedsLevel;
}

export function nextFlirt(state, id, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  const r = rel(state, id, now);
  return c.flirts[(r.flirtIdx || 0) % c.flirts.length];
}

export function flirt(state, id, choiceIndex, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  if (!canFlirt(state, id)) return { ok: false, reason: 'locked' };
  const r = rel(state, id, now);
  const choice = nextFlirt(state, id, now).choices[choiceIndex];
  if (!choice) return { ok: false, reason: 'bad-choice' };
  const score = vibeScore(c, choice.v);
  const counts = r.flirts < B().dailyCaps.flirts;
  r.flirts += 1;
  r.flirtIdx = (r.flirtIdx || 0) + 1;
  const res = counts ? addPoints(state, id, B().flirtPoints[score]) : { gained: 0, levelUp: null };
  recordEvent(state, 'flirt', { id }, now);
  return { ok: true, grade: grade(score), reaction: choice.r, ...res, capped: !counts };
}

// ------------------------------------------------------------------ gifts
export function giftReaction(id, giftId) {
  const c = CHARACTER_BY_ID[id];
  if (c.gifts.love.includes(giftId)) return 'love';
  if (c.gifts.like.includes(giftId)) return 'like';
  if (c.gifts.dislike.includes(giftId)) return 'dislike';
  return 'neutral';
}

export function giveGift(state, id, giftId, now = Date.now()) {
  const g = GIFT_BY_ID[giftId];
  const r = rel(state, id, now);
  if (!g) return { ok: false, reason: 'unknown-gift' };
  if (!r.met) return { ok: false, reason: 'not-met' };
  if (!canAfford(state, { coins: g.price })) return { ok: false, reason: 'insufficient-funds' };
  spend(state, { coins: g.price });
  const reaction = giftReaction(id, giftId);
  const counts = r.gifts < B().dailyCaps.gifts;
  r.gifts += 1;
  const res = counts ? addPoints(state, id, B().giftPoints[reaction]) : { gained: 0, levelUp: null };
  recordEvent(state, 'gift', { id, reaction }, now);
  return { ok: true, reaction, ...res, capped: !counts };
}

// ------------------------------------------------------------------ dates
export function canDate(state, id) {
  const c = CHARACTER_BY_ID[id];
  return c?.kind === 'romance' && levelOf(state, id).index >= B().datesNeedLevel;
}

export function outfitBonus(state, venueId) {
  const v = VENUE_BY_ID[venueId];
  const n = Object.values(state.equipped).filter((iid) => iid && CLOTHING_BY_ID[iid]?.styles.some((t) => v.styles.includes(t))).length;
  return Math.min(B().dateOutfitBonusMax, n * B().dateOutfitBonusPerItem);
}

/**
 * Go on a date. choices = the index picked for each of the venue's beats.
 * Returns per-beat reactions, hearts (1–3) and points.
 */
export function goOnDate(state, id, venueId, choices, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  const v = VENUE_BY_ID[venueId];
  if (!c || !v) return { ok: false, reason: 'unknown' };
  if (!canDate(state, id)) return { ok: false, reason: 'locked' };
  if (!Array.isArray(choices) || choices.length !== v.beats.length) return { ok: false, reason: 'bad-choices' };
  if (!canAfford(state, { coins: v.cost })) return { ok: false, reason: 'insufficient-funds' };
  spend(state, { coins: v.cost });
  const r = rel(state, id, now);
  const beats = v.beats.map((b, i) => {
    const ch = b.choices[choices[i]] || b.choices[0];
    const score = vibeScore(c, ch.v);
    return { choice: ch.t, grade: grade(score), points: B().vibePoints[score], reaction: c.reactions[grade(score)][i % c.reactions[grade(score)].length] };
  });
  const convo = beats.reduce((n, b) => n + b.points, 0);
  const bonus = outfitBonus(state, venueId);
  const raw = convo + bonus;
  const first = !r.dated;
  const pts = first ? raw : Math.round(raw * B().dateRepeatFactor);
  r.dated = true;
  r.dates += 1;
  state.stats.dates = (state.stats.dates || 0) + 1;
  const res = addPoints(state, id, pts);
  const g = first ? grant(state, B().dateReward, `date:${id}:${dateKey(now)}`) : { levels: [] };
  const hearts = convo >= 30 ? 3 : convo >= 16 ? 2 : 1;
  recordEvent(state, 'date', { id, venue: venueId }, now);
  pushMessage(state, id, hearts === 3 ? 'Best. Date. Ever. 💗' : hearts === 2 ? 'I had a really nice time tonight 😊' : 'Thanks for tonight!', now + 1000);
  return { ok: true, beats, bonus, hearts, reward: first ? B().dateReward : null, levels: g.levels || [], repeat: !first, ...res };
}

// ------------------------------------------------------------------ partners
export function askPartner(state, id, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  if (c?.kind !== 'romance') return { ok: false, reason: 'not-romance' };
  if (isPartner(state, id)) return { ok: false, reason: 'already-partners' };
  if (state.social.partner) return { ok: false, reason: 'taken', message: 'You\'re already with someone — stay loyal!' };
  const r = rel(state, id, now);
  if (levelOf(state, id).index < B().partnerNeedsLevel || r.dates < 1) return { ok: true, accepted: false, line: c.ask.no };
  state.social.partner = id;
  recordEvent(state, 'partner', { id }, now);
  pushMessage(state, id, 'Still smiling about earlier. Officially yours 💕', now + 1000);
  return { ok: true, accepted: true, line: c.ask.yes };
}

export function breakUp(state) {
  const id = state.social.partner;
  if (!id) return { ok: false, reason: 'single' };
  state.social.partner = null;
  const r = state.social.rel[id];
  r.points = Math.min(B().unpartneredCap, Math.round(r.points * (1 - B().breakUpPenalty)));
  return { ok: true, id };
}

// ------------------------------------------------------------------ visits & parties
export function canInvite(state, id) {
  return levelOf(state, id).index >= B().inviteNeedsLevel || isPartner(state, id);
}

export function hosting(state, now = Date.now()) {
  if (!state.social) state.social = emptySocial();
  const h = state.social.hosting;
  if (h.day !== dateKey(now)) { h.day = dateKey(now); h.guests = []; }
  return h;
}

export function inviteHome(state, id, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  if (!c || !rel(state, id, now).met) return { ok: false, reason: 'not-met' };
  if (!canInvite(state, id)) return { ok: false, reason: 'locked' };
  const h = hosting(state, now);
  if (!h.guests.includes(id)) {
    if (h.guests.length >= B().party.maxGuests) h.guests.shift();
    h.guests.push(id);
  }
  const r = rel(state, id, now);
  let res = { gained: 0, levelUp: null };
  let g = { levels: [] };
  if (!r.visited) {
    r.visited = true;
    res = addPoints(state, id, B().visit.points);
    g = grant(state, { xp: B().visit.xp, fame: B().visit.fame }, `visit:${id}:${dateKey(now)}`);
  }
  recordEvent(state, 'visit', { id }, now);
  return { ok: true, levels: g.levels || [], first: res.gained > 0, ...res };
}

export function hostParty(state, guestIds, now = Date.now()) {
  const P = B().party;
  const guests = [...new Set(guestIds)].filter((id) => CHARACTER_BY_ID[id] && rel(state, id, now).met && canInvite(state, id));
  if (!guests.length) return { ok: false, reason: 'no-guests' };
  if (guests.length > P.maxGuests) return { ok: false, reason: 'too-many' };
  if (!canAfford(state, { coins: P.cost })) return { ok: false, reason: 'insufficient-funds' };
  spend(state, { coins: P.cost });
  const h = hosting(state, now);
  h.guests = guests;
  const tx = `party:${dateKey(now)}`;
  const first = !state.ledger.processed[tx];
  const g = grant(state, first ? { xp: P.xp, fame: P.fame } : {}, tx);
  const ups = [];
  if (first) for (const id of guests) { const res = addPoints(state, id, P.guestPoints); if (res.levelUp) ups.push({ id, level: res.levelUp }); }
  state.social.parties += 1;
  recordEvent(state, 'party', { guests: guests.length }, now);
  return { ok: true, guests, first, reward: first ? { xp: P.xp, fame: P.fame } : null, levels: g.levels || [], levelUps: ups };
}

export function visitFriendHome(state, id, now = Date.now()) {
  const c = CHARACTER_BY_ID[id];
  if (c?.kind !== 'friend' || !c.house) return { ok: false, reason: 'no-home' };
  if (levelOf(state, id).index < B().inviteNeedsLevel) return { ok: false, reason: 'locked' };
  const r = rel(state, id, now);
  let res = { gained: 0, levelUp: null };
  let g = { levels: [] };
  if (!r.homeVisited) {
    r.homeVisited = true;
    res = addPoints(state, id, B().friendHomeVisit.points);
    g = grant(state, { xp: B().friendHomeVisit.xp }, `homevisit:${id}:${dateKey(now)}`);
  }
  recordEvent(state, 'visit', { id, theirs: true }, now);
  return { ok: true, levels: g.levels || [], ...res };
}

// ------------------------------------------------------------------ messages
const REPLIES = [{ t: '💗', v: 'sweet' }, { t: 'Haha you\'re the best 😂', v: 'funny' }, { t: 'Come find me later 😉', v: 'bold' }];

export function pushMessage(state, from, text, now = Date.now(), withReplies = true) {
  if (!state.social) state.social = emptySocial();
  const s = state.social;
  s.messages.push({ id: `m${s.msgSeq++}`, from, text, at: now, read: false, replies: withReplies ? REPLIES : null, replied: null });
  if (s.messages.length > 150) s.messages.splice(0, s.messages.length - 150);
}

export function replyMessage(state, msgId, idx, now = Date.now()) {
  const m = state.social.messages.find((x) => x.id === msgId);
  if (!m || !m.replies || m.replied !== null) return { ok: false, reason: 'cannot-reply' };
  const choice = m.replies[idx];
  if (!choice) return { ok: false, reason: 'bad-choice' };
  m.replied = idx;
  m.read = true;
  const c = CHARACTER_BY_ID[m.from];
  const score = vibeScore(c, choice.v);
  const res = score >= 0 ? addPoints(state, m.from, B().replyPoints) : { gained: 0, levelUp: null };
  rel(state, m.from, now);
  return { ok: true, grade: grade(score), ...res };
}

export function markThreadRead(state, from) {
  for (const m of state.social.messages) if (m.from === from) m.read = true;
  return { ok: true };
}

export const unreadCount = (state) => (state.social?.messages || []).filter((m) => !m.read).length;

/** Once per day: your partner says good morning, and some friends text you. */
export function dailyTexts(state, now = Date.now()) {
  if (!state.social) state.social = emptySocial();
  const dk = dateKey(now);
  if (state.social.lastTextDay === dk) return false;
  state.social.lastTextDay = dk;
  const rnd = seededRandom(`texts:${dk}`);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  if (state.social.partner) pushMessage(state, state.social.partner, pick(CHARACTER_BY_ID[state.social.partner].texts.morning), now);
  for (const id of metIds(state)) {
    if (id === state.social.partner || levelOf(state, id).index < 2 || rnd() > 0.45) continue;
    const t = CHARACTER_BY_ID[id].texts;
    pushMessage(state, id, pick(rnd() < 0.5 ? t.miss : t.invite), now + 1);
  }
  return true;
}

/** Friends & partner react to big moments (contest wins, new homes…). */
export function notifyMilestone(state, kind, now = Date.now()) {
  if (!state.social) return;
  const people = [state.social.partner, ...metIds(state).filter((id) => id !== state.social.partner && levelOf(state, id).index >= 2)].filter(Boolean).slice(0, 3);
  for (const id of people) {
    const t = CHARACTER_BY_ID[id].texts;
    const text = kind === 'contestWin' ? t.congrats[0] : kind === 'property' ? 'A new home?! Housewarming party when?? 🏡' : t.congrats[t.congrats.length - 1];
    pushMessage(state, id, text, now);
  }
}

export function relationshipStatus(state) {
  const p = state.social?.partner;
  return p ? `Dating ${CHARACTER_BY_ID[p].name.split(' ')[0]} 💕` : 'Single';
}
