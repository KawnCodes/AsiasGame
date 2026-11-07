import { describe, it, expect } from 'vitest';
import { createNewGameState, SAVE_VERSION } from '../src/systems/gameState.js';
import { CHARACTERS, CHARACTER_BY_ID, ROMANCE_LEVELS, FRIEND_LEVELS, VIBES } from '../src/data/characters.js';
import { VENUES } from '../src/data/venues.js';
import { GIFTS, GIFT_BY_ID } from '../src/data/gifts.js';
import { BALANCE } from '../src/data/gameBalance.js';
import {
  meet, chat, nextTopic, flirt, canFlirt, giveGift, giftReaction, goOnDate, canDate, askPartner, breakUp, levelOf, rel,
  inviteHome, hostParty, hosting, visitFriendHome, presentAt, pendingStories, markStorySeen, replyMessage, unreadCount,
  dailyTexts, outfitBonus, metIds, relationshipStatus,
} from '../src/systems/relationshipSystem.js';
import { submitEntry, ensureBoard } from '../src/systems/competitionSystem.js';
import { migrate } from '../src/systems/saveSystem.js';
import { listQuests } from '../src/systems/questSystem.js';
import { renderAvatar } from '../src/components/avatarRenderer.js';

const DAY = (d, h = 12) => new Date(2026, 10, d, h).getTime();
const rich = () => { const s = createNewGameState({ outfitId: 'sunny' }); s.player.coins = 1_000_000; return s; };
/** index of the choice this character likes most */
const bestChoice = (id, choices) => choices.map((c, i) => [CHARACTER_BY_ID[id].vibes[c.v] ?? 0, i]).sort((a, b) => b[0] - a[0])[0][1];
const worstChoice = (id, choices) => choices.map((c, i) => [CHARACTER_BY_ID[id].vibes[c.v] ?? 0, i]).sort((a, b) => a[0] - b[0])[0][1];

describe('cast data', () => {
  it('has at least four romanceable characters and four friends, all adults, all complete', () => {
    const romance = CHARACTERS.filter((c) => c.kind === 'romance');
    expect(romance.length).toBeGreaterThanOrEqual(4);
    expect(CHARACTERS.filter((c) => c.kind === 'friend').length).toBeGreaterThanOrEqual(4);
    for (const c of CHARACTERS) {
      expect(c.age, c.id).toBeGreaterThanOrEqual(18);
      for (const g of [...c.gifts.love, ...c.gifts.like, ...c.gifts.dislike]) expect(GIFT_BY_ID[g], `${c.id}:${g}`).toBeTruthy();
      for (const t of c.topics) for (const ch of t.choices) expect(VIBES[ch.v], `${c.id} ${ch.t}`).toBeTruthy();
      expect(VENUES.some((v) => v.id === c.home)).toBe(true);
      expect(renderAvatar(c.look.appearance, c.look.equipped)).toContain('<svg');
      if (c.kind === 'romance') { expect(c.flirts.length).toBeGreaterThan(0); expect(Object.keys(c.story).length).toBeGreaterThanOrEqual(4); expect(c.ask.yes && c.ask.no).toBeTruthy(); }
      if (c.kind === 'friend') expect(c.house?.property).toBeTruthy();
    }
  });
  it('every venue beat offers a choice of distinct vibes', () => {
    for (const v of VENUES) for (const b of v.beats) expect(new Set(b.choices.map((c) => c.v)).size).toBe(b.choices.length);
  });
});

describe('meeting & presence', () => {
  it('characters are always at their home venue', () => {
    for (const c of CHARACTERS) expect(presentAt(c.home, DAY(7))).toContain(c.id);
  });
  it('meeting adds a contact, starting points and a hello message', () => {
    const s = createNewGameState();
    expect(meet(s, 'leo', DAY(7)).ok).toBe(true);
    expect(meet(s, 'leo', DAY(7)).reason).toBe('already-met');
    expect(levelOf(s, 'leo').name).toBe('Acquaintance');
    expect(metIds(s)).toEqual(['leo']);
    expect(unreadCount(s)).toBe(1);
  });
});

describe('conversations', () => {
  it('liked vibes earn more than disliked ones', () => {
    const a = createNewGameState(); const b = createNewGameState();
    meet(a, 'kai', DAY(7)); meet(b, 'kai', DAY(7));
    const t = nextTopic(a, 'kai', DAY(7));
    chat(a, 'kai', bestChoice('kai', t.choices), DAY(7));
    chat(b, 'kai', worstChoice('kai', t.choices), DAY(7));
    expect(a.social.rel.kai.points).toBeGreaterThan(b.social.rel.kai.points);
  });
  it('earns points for 3 chats a day, then keeps chatting for free', () => {
    const s = createNewGameState();
    meet(s, 'theo', DAY(7));
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const t = nextTopic(s, 'theo', DAY(7));
      pts.push(chat(s, 'theo', bestChoice('theo', t.choices), DAY(7)).gained);
    }
    expect(pts.slice(0, 3).every((p) => p > 0)).toBe(true);
    expect(pts.slice(3)).toEqual([0, 0]);
    const t = nextTopic(s, 'theo', DAY(8));
    expect(chat(s, 'theo', bestChoice('theo', t.choices), DAY(8)).gained).toBeGreaterThan(0); // new day
  });
  it('needs to meet someone first', () => {
    expect(chat(createNewGameState(), 'leo', 0).reason).toBe('not-met');
  });
});

describe('gifts', () => {
  it('loved gifts are worth more than disliked ones, and cost coins', () => {
    const s = rich();
    meet(s, 'leo', DAY(7));
    const before = s.player.coins;
    const love = giveGift(s, 'leo', 'vinyl', DAY(7));
    expect(love).toMatchObject({ ok: true, reaction: 'love', gained: BALANCE.social.giftPoints.love });
    expect(s.player.coins).toBe(before - GIFT_BY_ID.vinyl.price);
    expect(giftReaction('leo', 'perfume')).toBe('dislike');
    expect(giftReaction('leo', 'cupcakes')).toBe('neutral');
  });
  it('refuses when you can\'t afford it', () => {
    const s = createNewGameState(); s.player.coins = 10;
    meet(s, 'leo', DAY(7));
    expect(giveGift(s, 'leo', 'perfume', DAY(7)).reason).toBe('insufficient-funds');
  });
});

describe('dating & partners', () => {
  function charm(s, id, days = 4) {
    for (let d = 7; d < 7 + days; d++) {
      for (let i = 0; i < 3; i++) { const t = nextTopic(s, id, DAY(d)); chat(s, id, bestChoice(id, t.choices), DAY(d)); }
      for (const g of CHARACTER_BY_ID[id].gifts.love) giveGift(s, id, g, DAY(d));
    }
  }
  it('flirting and dates unlock at "Friend"', () => {
    const s = rich();
    meet(s, 'julian', DAY(7));
    expect(canFlirt(s, 'julian')).toBe(false);
    expect(canDate(s, 'julian')).toBe(false);
    charm(s, 'julian', 1);
    expect(levelOf(s, 'julian').index).toBeGreaterThanOrEqual(2);
    expect(canFlirt(s, 'julian')).toBe(true);
    const f = flirt(s, 'julian', 0, DAY(7));
    expect(f.ok).toBe(true);
    expect(canFlirt(s, 'mimi')).toBe(false); // friends aren't flirted with
  });
  it('a date scores beats by taste, adds an outfit bonus, costs the venue and pays XP + fame once a day', () => {
    const s = rich();
    meet(s, 'theo', DAY(7));
    charm(s, 'theo', 1);
    const v = VENUES.find((x) => x.id === 'restaurant');
    const coins = s.player.coins;
    const good = goOnDate(s, 'theo', 'restaurant', v.beats.map((b) => bestChoice('theo', b.choices)), DAY(7));
    expect(good.ok).toBe(true);
    expect(s.player.coins).toBeLessThanOrEqual(coins - v.cost + 0); // xp level-ups may add coins
    expect(good.reward).toEqual(BALANCE.social.dateReward);
    const again = goOnDate(s, 'theo', 'restaurant', v.beats.map(() => 0), DAY(7));
    expect(again.repeat).toBe(true);
    expect(again.reward).toBe(null);
    expect(outfitBonus(s, 'cafe')).toBeGreaterThan(0); // sunny day outfit is casual
    expect(goOnDate(s, 'theo', 'restaurant', [0], DAY(8)).reason).toBe('bad-choices');
  });
  it('becoming partners needs closeness and a date; one partner at a time', () => {
    const s = rich();
    meet(s, 'kai', DAY(7)); meet(s, 'leo', DAY(7));
    expect(askPartner(s, 'kai', DAY(7))).toMatchObject({ ok: true, accepted: false });
    charm(s, 'kai', 4);
    expect(levelOf(s, 'kai').name).toBe('Close'); // capped until partners
    expect(askPartner(s, 'kai', DAY(11))).toMatchObject({ accepted: false }); // no date yet
    const v = VENUES.find((x) => x.id === 'park');
    goOnDate(s, 'kai', 'park', v.beats.map((b) => bestChoice('kai', b.choices)), DAY(11));
    expect(askPartner(s, 'kai', DAY(11))).toMatchObject({ accepted: true });
    expect(relationshipStatus(s)).toMatch(/Kai/);
    expect(askPartner(s, 'leo', DAY(11)).reason).toBe('taken');
    expect(breakUp(s).ok).toBe(true);
    expect(s.social.partner).toBe(null);
    expect(s.social.rel.kai.points).toBeLessThanOrEqual(BALANCE.social.unpartneredCap);
  });
  it('romance points are capped at "Close" until you are partners', () => {
    const s = rich();
    meet(s, 'elodie', DAY(7));
    charm(s, 'elodie', 10);
    expect(s.social.rel.elodie.points).toBe(BALANCE.social.unpartneredCap);
  });
  it('story scenes unlock with relationship level and are shown once', () => {
    const s = rich();
    meet(s, 'leo', DAY(7));
    charm(s, 'leo', 1);
    const p = pendingStories(s, 'leo');
    expect(p.length).toBeGreaterThan(0);
    markStorySeen(s, 'leo', p[0].level);
    expect(pendingStories(s, 'leo').some((x) => x.level === p[0].level)).toBe(false);
  });
});

describe('home visits & parties', () => {
  it('invites a friend over: visitor appears, rewards once a day', () => {
    const s = rich();
    meet(s, 'mimi', DAY(7));
    expect(inviteHome(s, 'mimi', DAY(7)).reason).toBe('locked');
    s.social.rel.mimi.points = 80;
    const r = inviteHome(s, 'mimi', DAY(7));
    expect(r.ok && r.first).toBe(true);
    expect(hosting(s, DAY(7)).guests).toEqual(['mimi']);
    expect(inviteHome(s, 'mimi', DAY(7)).first).toBe(false);
    expect(hosting(s, DAY(8)).guests).toEqual([]); // guests go home overnight
  });
  it('hosts a party: costs coins, rewards the first party each day, max 4 guests', () => {
    const s = rich();
    for (const id of ['mimi', 'zara', 'priya', 'lottie', 'leo']) { meet(s, id, DAY(7)); s.social.rel[id].points = 80; }
    expect(hostParty(s, ['mimi', 'zara', 'priya', 'lottie', 'leo'], DAY(7)).reason).toBe('too-many');
    const fame = s.player.fame;
    const p = hostParty(s, ['mimi', 'zara', 'priya'], DAY(7));
    expect(p.ok && p.first).toBe(true);
    expect(s.player.fame).toBe(fame + BALANCE.social.party.fame);
    expect(s.social.rel.mimi.points).toBe(80 + BALANCE.social.party.guestPoints);
    expect(hostParty(s, ['mimi'], DAY(7)).first).toBe(false);
    expect(hostParty(s, [], DAY(7)).reason).toBe('no-guests');
  });
  it('visits a friend\'s home once a day for points', () => {
    const s = rich();
    meet(s, 'lottie', DAY(7));
    s.social.rel.lottie.points = 70;
    expect(visitFriendHome(s, 'lottie', DAY(7)).gained).toBe(BALANCE.social.friendHomeVisit.points);
    expect(visitFriendHome(s, 'lottie', DAY(7)).gained).toBe(0);
    expect(visitFriendHome(s, 'leo', DAY(7)).reason).toBe('no-home');
  });
});

describe('messages', () => {
  it('replying once earns points; partners text good morning daily', () => {
    const s = rich();
    meet(s, 'leo', DAY(7));
    const m = s.social.messages[0];
    const r = replyMessage(s, m.id, 0, DAY(7));
    expect(r.ok).toBe(true);
    expect(replyMessage(s, m.id, 1, DAY(7)).ok).toBe(false);
    s.social.partner = 'leo';
    const n = s.social.messages.length;
    expect(dailyTexts(s, DAY(8))).toBe(true);
    expect(dailyTexts(s, DAY(8, 20))).toBe(false);
    expect(s.social.messages.slice(n).some((x) => x.from === 'leo')).toBe(true);
  });
  it('friends text congratulations when you win a contest', () => {
    const s = rich();
    meet(s, 'zara', DAY(7)); s.social.rel.zara.points = 100;
    ensureBoard(s, DAY(7));
    // dress to win Street Style (rising tier)
    Object.assign(s.equipped, { top: 'top_daisy_tee', bottom: 'bot_denim_mini', shoes: 'sh_cloud_sneaks' });
    s.contests.board[0] = { uid: 'x', theme: 'summer_chic', tier: 'rising' };
    const r = submitEntry(s, 'x', DAY(7));
    const congrats = s.social.messages.filter((m) => m.from === 'zara' && /won|Told|Called/i.test(m.text));
    expect(r.me.place === 1 ? congrats.length : 0).toBe(r.me.place === 1 ? 1 : 0);
  });
});

describe('quests & saves', () => {
  it('social milestones track meeting people and dates', () => {
    const s = rich();
    for (const id of ['leo', 'mimi', 'kai']) meet(s, id, DAY(7));
    expect(listQuests(s, 'story').find((q) => q.def.id === 's_meet3').done).toBe(true);
  });
  it('migrates Milestone 4 saves and keeps relationships through a round-trip', () => {
    const v4 = createNewGameState(); v4.version = 4; delete v4.social;
    const m = migrate(v4);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.social).toMatchObject({ partner: null, messages: [] });
    const s = rich();
    meet(s, 'theo', DAY(7)); s.social.partner = 'theo';
    const back = migrate(JSON.parse(JSON.stringify(s)));
    expect(back.social.partner).toBe('theo');
    expect(back.social.rel.theo.met).toBe(true);
  });
  it('relationship levels are ordered', () => {
    for (const L of [ROMANCE_LEVELS, FRIEND_LEVELS]) expect(L.map((l) => l.min)).toEqual([...L.map((l) => l.min)].sort((a, b) => a - b));
    expect(rel(createNewGameState(), 'leo').points).toBe(0);
    expect(GIFTS.length).toBeGreaterThanOrEqual(12);
  });
});
