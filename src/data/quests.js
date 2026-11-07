/**
 * QUESTS — daily, weekly and long-term ("story") goals.
 *
 * A quest counts progress either from game EVENTS or from a live STAT:
 *   { event: 'job', where: { career: 'modelling' }, target: 3 }
 *   { event: 'jobCoins', amount: true, target: 2000 }   // adds payload.amount
 *   { stat: (s) => s.player.level, target: 5 }          // reads state directly
 * Events emitted by the systems: job, jobCoins, buy, outfit, daily, promotion, restyle, contest,
 * buyFurniture, decorate, property, upgrade.
 *
 * Daily quests: QUESTS_PER_DAY are picked from DAILY_POOL by a seed of the local date,
 * so everyone sees the same three on the same day and they never reshuffle mid-day.
 */
export const QUESTS_PER_DAY = 3;
export const QUESTS_PER_WEEK = 3;

export const DAILY_POOL = [
  { id: 'd_jobs3', title: 'Busy Bee', text: 'Complete 3 jobs', event: 'job', target: 3, reward: { coins: 400, xp: 60 } },
  { id: 'd_jobs6', title: 'Workaholic', text: 'Complete 6 jobs', event: 'job', target: 6, reward: { coins: 800, xp: 120, gems: 3 } },
  { id: 'd_model2', title: 'Strike a Pose', text: 'Complete 2 modelling jobs', event: 'job', where: { career: 'modelling' }, target: 2, reward: { coins: 450, xp: 60 } },
  { id: 'd_sing1', title: 'Find Your Voice', text: 'Complete a singing job', event: 'job', where: { career: 'singing' }, target: 1, reward: { coins: 350, xp: 50 }, needsLevel: 2 },
  { id: 'd_act1', title: 'Lights, Camera…', text: 'Complete an acting job', event: 'job', where: { career: 'acting' }, target: 1, reward: { coins: 350, xp: 50 }, needsLevel: 3 },
  { id: 'd_earn2k', title: 'Payday', text: 'Earn 2,000 coins from jobs', event: 'jobCoins', amount: true, target: 2000, reward: { coins: 500, xp: 60 } },
  { id: 'd_buy1', title: 'Retail Therapy', text: 'Buy any new item', event: 'buy', target: 1, reward: { coins: 300, xp: 40 } },
  { id: 'd_dress', title: 'Dress to Impress', text: 'Buy a new dress or gown', event: 'buy', where: { category: ['dresses', 'special'] }, target: 1, reward: { coins: 600, xp: 60, gems: 2 } },
  { id: 'd_look', title: 'Lookbook', text: 'Save a look in your wardrobe', event: 'outfit', target: 1, reward: { coins: 300, xp: 40 } },
  { id: 'd_contest', title: 'Strut Your Stuff', text: 'Enter a fashion contest', event: 'contest', target: 1, reward: { coins: 400, xp: 60 } },
  { id: 'd_podium', title: 'Podium Finish', text: 'Place top 3 in a contest', event: 'contest', where: { place: [1, 2, 3] }, target: 1, reward: { coins: 700, xp: 80, gems: 3 } },
  { id: 'd_decorate', title: 'Interior Designer', text: 'Place 3 pieces of furniture', event: 'decorate', target: 3, reward: { coins: 400, xp: 60 } },
  { id: 'd_furniture', title: 'Home Comforts', text: 'Buy 2 pieces of furniture or décor', event: 'buyFurniture', amount: true, target: 2, reward: { coins: 500, xp: 60 } },
  { id: 'd_restyle', title: 'Mirror Moment', text: 'Change your hair or makeup in the mirror', event: 'restyle', target: 1, reward: { coins: 300, xp: 40 } },
];

export const WEEKLY_POOL = [
  { id: 'w_jobs25', title: 'Hard-Working Star', text: 'Complete 25 jobs this week', event: 'job', target: 25, reward: { coins: 2500, xp: 400, gems: 10 } },
  { id: 'w_earn10k', title: 'Big Earner', text: 'Earn 10,000 coins from jobs', event: 'jobCoins', amount: true, target: 10000, reward: { coins: 2000, xp: 300, gems: 8 } },
  { id: 'w_buy5', title: 'Shopaholic', text: 'Buy 5 items', event: 'buy', target: 5, reward: { coins: 1500, xp: 250, gems: 5 } },
  { id: 'w_promo', title: 'Moving Up', text: 'Earn a career promotion', event: 'promotion', target: 1, reward: { coins: 1500, xp: 300, gems: 5 } },
  { id: 'w_daily4', title: 'Regular', text: 'Claim your daily gift 4 times', event: 'daily', target: 4, reward: { coins: 1500, xp: 200, gems: 10 } },
  { id: 'w_win3', title: 'Champion', text: 'Win 3 fashion contests', event: 'contest', where: { place: 1 }, target: 3, reward: { coins: 2500, xp: 400, gems: 10 } },
  { id: 'w_contest6', title: 'Runway Regular', text: 'Enter 6 fashion contests', event: 'contest', target: 6, reward: { coins: 1800, xp: 300, gems: 6 } },
  { id: 'w_furniture5', title: 'Home Shopper', text: 'Buy 5 pieces of furniture or décor', event: 'buyFurniture', amount: true, target: 5, reward: { coins: 1500, xp: 250, gems: 5 } },
  { id: 'w_decorate15', title: 'Makeover Week', text: 'Place 15 pieces of furniture', event: 'decorate', target: 15, reward: { coins: 1800, xp: 300, gems: 6 } },
  { id: 'w_looks3', title: 'Stylist at Heart', text: 'Save 3 looks', event: 'outfit', target: 3, reward: { coins: 1000, xp: 200 } },
];

const roomCounts = (s) => Object.entries(s.homes || {}).flatMap(([pid, h]) => Object.entries(h.rooms || {}).map(([rid, r]) => ({ pid, rid, n: Object.keys(r.placed || {}).length })));
const bedroomMax = (s) => Math.max(0, ...roomCounts(s).filter((r) => r.rid === 'bedroom' || r.rid === 'up_extra_bedroom').map((r) => r.n));
const furnished = (s) => roomCounts(s).filter((r) => r.n >= 6).length;
const careerMax = (s) => Math.max(...Object.values(s.careers || {}).map((c) => c.level || 1), 1);

export const STORY_QUESTS = [
  { id: 's_firstbuy', title: 'Treat Yourself', text: 'Buy your first item', category: 'Fashion', stat: (s) => s.stats.itemsBought, target: 1, reward: { coins: 300, xp: 50 } },
  { id: 's_firstjob', title: 'First Day on the Job', text: 'Complete your first job', category: 'Careers', stat: (s) => s.stats.jobsCompleted || 0, target: 1, reward: { coins: 500, xp: 80 } },
  { id: 's_level3', title: 'Getting Noticed', text: 'Reach level 3', category: 'Fame', stat: (s) => s.player.level, target: 3, reward: { coins: 600, gems: 5 } },
  { id: 's_dress', title: 'Little Dress Moment', text: 'Own 3 dresses or gowns', category: 'Fashion', stat: (s) => Object.keys(s.inventory.clothing).filter((id) => /^(dr_|gown_)/.test(id)).length, target: 3, reward: { coins: 700, xp: 100 } },
  { id: 's_hair', title: 'New Hair, New Me', text: 'Buy a new hairstyle at the salon', category: 'Fashion', stat: (s) => s.inventory.hairstyles.length, target: 1, reward: { coins: 500, xp: 80 } },
  { id: 's_threecareers', title: 'Triple Threat', text: 'Complete a job in all three careers', category: 'Careers', stat: (s) => Object.values(s.careers || {}).filter((c) => c.jobsDone > 0).length, target: 3, reward: { coins: 1000, gems: 10 } },
  { id: 's_firstcontest', title: 'Runway Debut', text: 'Enter your first fashion contest', category: 'Contests', stat: (s) => s.contests?.entries || 0, target: 1, reward: { coins: 500, xp: 80 } },
  { id: 's_firstwin', title: 'First Crown', text: 'Win a fashion contest', category: 'Contests', stat: (s) => s.contests?.wins || 0, target: 1, reward: { coins: 1000, gems: 10 } },
  { id: 's_promo', title: 'Promoted!', text: 'Earn your first career promotion', category: 'Careers', stat: (s) => s.stats.promotions || 0, target: 1, reward: { coins: 800, xp: 120 } },
  { id: 's_level5', title: 'Rising Starlet', text: 'Reach level 5', category: 'Fame', stat: (s) => s.player.level, target: 5, reward: { coins: 1000, gems: 10 } },
  { id: 's_looks3', title: 'Signature Style', text: 'Save 3 looks', category: 'Fashion', stat: (s) => s.outfits.length, target: 3, reward: { coins: 600, xp: 100 } },
  { id: 's_jobs50', title: 'Professional', text: 'Complete 50 jobs', category: 'Careers', stat: (s) => s.stats.jobsCompleted || 0, target: 50, reward: { coins: 2500, gems: 15 } },
  { id: 's_fame500', title: 'Local Celebrity', text: 'Reach 500 fame', category: 'Fame', stat: (s) => s.player.fame, target: 500, reward: { coins: 1500, gems: 10 } },
  { id: 's_career5', title: 'Career Highlight', text: 'Reach career level 5 in any career', category: 'Careers', stat: careerMax, target: 5, reward: { coins: 2000, gems: 15 } },
  { id: 's_score90', title: 'Judges\' Darling', text: 'Score 90% or more in a contest', category: 'Contests', stat: (s) => s.contests?.bestPercent || 0, target: 90, reward: { coins: 2000, gems: 15 } },
  { id: 's_wins10', title: 'Pageant Queen', text: 'Win 10 fashion contests', category: 'Contests', stat: (s) => s.contests?.wins || 0, target: 10, reward: { coins: 3000, gems: 25 } },
  { id: 's_galawin', title: 'Belle of the Gala', text: 'Win a Grand Gala contest', category: 'Contests', stat: (s) => s.contests?.galaWins || 0, target: 1, reward: { coins: 4000, gems: 30 } },
  { id: 's_furniture5', title: 'Nesting', text: 'Buy five pieces of furniture or décor', category: 'Home', stat: (s) => s.stats.furnitureBought || 0, target: 5, reward: { coins: 800, xp: 100 } },
  { id: 's_bedroom', title: 'Dream Bedroom', text: 'Decorate a bedroom with 12 pieces', category: 'Home', stat: bedroomMax, target: 12, reward: { coins: 1000, gems: 5 } },
  { id: 's_property', title: 'Moving Up', text: 'Purchase your first property', category: 'Home', stat: (s) => s.properties.owned.length - 1, target: 1, reward: { coins: 1500, gems: 10 } },
  { id: 's_upgrade', title: 'Renovator', text: 'Buy a home upgrade', category: 'Home', stat: (s) => Object.values(s.properties.upgrades || {}).flat().length, target: 1, reward: { coins: 1000, gems: 5 } },
  { id: 's_showhome', title: 'Show Home', text: 'Furnish 3 rooms with 6+ pieces each', category: 'Home', stat: furnished, target: 3, reward: { coins: 2000, gems: 15 } },
  { id: 's_mogul', title: 'Property Mogul', text: 'Own 4 homes', category: 'Home', stat: (s) => s.properties.owned.length, target: 4, reward: { coins: 5000, gems: 30 } },
  { id: 's_mansion', title: 'Living the Dream', text: 'Buy the Celebrity Mansion', category: 'Home', stat: (s) => (s.properties.owned.includes('mansion') ? 1 : 0), target: 1, reward: { coins: 10000, gems: 60 } },
  { id: 's_level10', title: 'It Girl', text: 'Reach level 10', category: 'Fame', stat: (s) => s.player.level, target: 10, reward: { coins: 3000, gems: 25 } },
  { id: 's_wardrobe40', title: 'Collector', text: 'Own 40 wardrobe pieces', category: 'Fashion', stat: (s) => Object.keys(s.inventory.clothing).length, target: 40, reward: { coins: 2000, gems: 15 } },
  { id: 's_career10', title: 'Living Legend', text: 'Reach career level 10 in any career', category: 'Careers', stat: careerMax, target: 10, reward: { coins: 5000, gems: 40 } },
  { id: 's_fame4000', title: 'Become a Famous Celebrity', text: 'Reach 4,000 fame', category: 'Fame', stat: (s) => s.player.fame, target: 4000, reward: { coins: 5000, gems: 40 } },
];

export const ALL_QUESTS = Object.fromEntries([...DAILY_POOL, ...WEEKLY_POOL, ...STORY_QUESTS].map((q) => [q.id, q]));
