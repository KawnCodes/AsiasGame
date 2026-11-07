/**
 * GAME BALANCE — the single place to tune Glamour City's economy & progression.
 *
 * Every number a designer might want to tweak lives here: starting balances, XP curve,
 * reward payouts, price bands, resale rates, job timers and contest prizes.
 * Systems import from this file; nothing else should hard-code economy values.
 */
export const BALANCE = {
  start: {
    coins: 5000,
    gems: 100,
    level: 1,
    xp: 0,
    fame: 0,
    property: 'starter_apartment',
  },

  xp: {
    base: 500, // XP required to go from level 1 → 2
    growth: 1.12, // gentle exponential scaling per level
    maxLevel: 100,
  },

  levelUpReward: { coins: 500, gems: 5 },

  // ---- daily login reward (local calendar day; streak resets after a missed day) ----
  daily: {
    coins: 1000,
    gems: 10,
    resetPolicy: 'local-calendar-day',
    // Day 1..7 of the streak. Day 1 is the base reward; the cycle repeats after day 7.
    streak: [
      { coins: 1000, gems: 10 },
      { coins: 1200, gems: 10 },
      { coins: 1400, gems: 12 },
      { coins: 1600, gems: 12 },
      { coins: 1800, gems: 15 },
      { coins: 2000, gems: 15 },
      { coins: 3000, gems: 30 },
    ],
  },

  // ---- jobs: four tiers. Durations in seconds (no job may exceed maxSeconds) ----
  jobs: {
    maxSeconds: 60,
    maxActivePerCareer: 1, // one job per career at a time → up to 3 timers running at once
    tiers: {
      beginner: { coins: 220, xp: 45, fame: 5, careerXP: 10 },
      standard: { coins: 500, xp: 100, fame: 10, careerXP: 25 },
      higher: { coins: 850, xp: 170, fame: 25, careerXP: 40 },
      celebrity: { coins: 1600, xp: 320, fame: 60, careerXP: 70 },
    },
    standardReward: { coins: 500, xp: 100 },
    styleBonus: 0.25, // +25% coins when 2+ worn items match the job's style
    styleMatchesNeeded: 2,
  },

  // ---- careers: cumulative career XP needed for career levels 1..10 ----
  careerLevels: [0, 50, 130, 260, 450, 700, 1050, 1500, 2100, 2850],

  rewards: {
    minigame: { coins: 250, xp: 50 },
    contestEntry: { coins: 200 },
    contestWin: { coins: 1500, gems: 20 },
    careerPromotion: { coins: 2000, gems: 15 },
    homeContestWin: { coins: 1500, gems: 10 },
    questRange: [300, 1000],
  },

  // ---- fashion contests (Milestone 3) ----
  contests: {
    boardSize: 4, // open contests on the Grand Pavilion board (refills instantly after entering)
    // skill: AI rivals pick on-theme pieces this often (0..1). mult scales every prize.
    tiers: {
      rising: { name: 'Rising Star', minLevel: 1, skill: [0.1, 0.35], mult: 1, rivals: 4 },
      city: { name: 'City Showcase', minLevel: 4, skill: [0.45, 0.7], mult: 1.6, rivals: 5 },
      gala: { name: 'Grand Gala', minLevel: 8, skill: [0.65, 0.9], mult: 2.5, rivals: 5 },
    },
    prizes: {
      1: { coins: 1500, gems: 20, xp: 200, fame: 60 },
      2: { coins: 800, gems: 5, xp: 120, fame: 35 },
      3: { coins: 500, gems: 0, xp: 90, fame: 25 },
      entry: { coins: 200, gems: 0, xp: 60, fame: 10 }, // everyone who finishes gets at least this
    },
    spotlightBonus: 0.5, // theme of the day pays +50% coins
    guestJudge: { coins: 75, xp: 15, paidRoundsPerDay: 10 },
  },

  // Reference price bands (coins) — the catalogue tests assert items stay inside them.
  priceBands: {
    top: [100, 300],
    bottom: [150, 500], // skirts / trousers / shorts
    dress: [300, 1000],
    premiumDress: [1000, 3000],
    shoes: [100, 600],
    hairstyle: [200, 800],
    accessory: [50, 400],
    outerwear: [200, 900],
    makeup: [50, 300],
    hairColor: [150, 400],
  },
  rareMarkup: 2.5, // rare/epic/legendary items may exceed their band up to band max × markup

  resaleRate: 0.5,

  // Gem → coin exchange offered at the bank kiosk (future); kept here for tuning.
  gemExchange: { gems: 10, coins: 1000 },
};

/** XP needed to advance FROM `level` to `level + 1`. */
export function requiredXP(level) {
  return Math.round(BALANCE.xp.base * Math.pow(BALANCE.xp.growth, level - 1));
}
