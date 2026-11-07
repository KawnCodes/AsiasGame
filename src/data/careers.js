/**
 * CAREERS & JOBS — data only. Tier rewards come from BALANCE.jobs.tiers so the whole
 * payout curve is tuned in gameBalance.js. Add a job by adding one line.
 *
 * job: { id, career, tier, name, blurb, seconds, careerLevel, level, styles, bonus? }
 *   careerLevel → career level required · level → player level required
 *   styles      → outfit style tags that earn the style bonus
 *   bonus       → optional per-job reward multiplier (default 1)
 */
import { BALANCE } from './gameBalance.js';

export const CAREERS = [
  {
    id: 'modelling', name: 'Modelling', icon: '📸', location: 'agency', studio: 'Belle Model Agency', unlockLevel: 1,
    color: '#b48cff', mentor: 'Vivienne Belle',
    mentorLook: { appearance: { skin: 'porcelain', hairStyle: 'bob', hairColor: 'platinum', eyes: 'cat', eyeliner: 'el_wing', lipstick: 'lip_red' }, equipped: { outerwear: 'jk_black_blazer', top: 'top_satin_cami', necklace: 'neck_pearls', earrings: 'ear_pearl' } },
    titles: ['New Face', 'Catalogue Model', 'Editorial Model', 'Advert Star', 'Runway Model', 'Campaign Model', 'Cover Girl', 'Top Model', 'Supermodel', 'Fashion Legend'],
    story: {
      2: 'Darling, the camera adores you. I\'m sending you to proper magazine shoots now!',
      3: 'The designers saw your test photos. You\'re walking the runway next week — chin up, shoulders back!',
      5: 'A luxury house wants YOU as the face of their new campaign. This is huge!',
      7: 'Cover girl! Every newsstand in Glamour City will have your face on it.',
      10: 'They\'re calling you a legend. I always knew you would be. Thank you for trusting me.',
    },
  },
  {
    id: 'singing', name: 'Singing', icon: '🎤', location: 'studio_music', studio: 'Starlight Records', unlockLevel: 2,
    color: '#ff7eb6', mentor: 'DJ Marlowe',
    mentorLook: { appearance: { skin: 'cocoa', hairStyle: 'twin_tails', hairColor: 'ocean', eyes: 'almond', lipstick: 'lip_berry' }, equipped: { outerwear: 'jk_leather', top: 'top_black_tank', earrings: 'ear_silver_hoops', necklace: 'neck_velvet_choker' } },
    titles: ['Shower Singer', 'Open-Mic Hopeful', 'Demo Artist', 'Studio Singer', 'Indie Darling', 'Chart Climber', 'Pop Sensation', 'Headliner', 'Superstar', 'Pop Royalty'],
    story: {
      2: 'That demo? Fire. Let\'s book you some real studio time.',
      3: 'We\'re putting you on stage — a small venue, but they\'ll remember your name.',
      5: 'The label wants a music video. Wardrobe, lights, the works!',
      7: 'Sold-out arena. Listen to that crowd — they\'re singing YOUR song.',
      10: 'Pop royalty. Your name is in lights all over the city.',
    },
  },
  {
    id: 'acting', name: 'Acting', icon: '🎬', location: 'studio_film', studio: 'Silver Screen Studios', unlockLevel: 3,
    color: '#f2b84b', mentor: 'Director Okafor',
    mentorLook: { appearance: { skin: 'mocha', hairStyle: 'top_bun', hairColor: 'black', eyes: 'doe', lipstick: 'lip_plum' }, equipped: { outerwear: 'coat_camel_trench', top: 'top_stripe_tee', hairAcc: 'hacc_beret', earrings: 'ear_gold_hoops' } },
    titles: ['Hopeful', 'Background Extra', 'Commercial Face', 'TV Regular', 'Supporting Actress', 'Rising Star', 'Leading Lady', 'Box-Office Draw', 'Movie Star', 'Screen Icon'],
    story: {
      2: 'You stole that commercial. I\'m casting you on my TV series.',
      3: 'A supporting role with real lines. Make every word count.',
      5: 'I\'m giving you the lead. The script was written with you in mind.',
      7: 'Red carpet tonight — the premiere is all about you.',
      10: 'A true screen icon. It has been an honour directing you.',
    },
  },
];

const J = (id, career, tier, name, blurb, seconds, careerLevel, styles, extra = {}) => ({ id, career, tier, name, blurb, seconds, careerLevel, styles, level: extra.level || 1, bonus: extra.bonus || 1 });

export const JOBS = [
  // Modelling
  J('mod_catalogue', 'modelling', 'beginner', 'Catalogue Shoot', 'Smile for a cosy knitwear catalogue.', 12, 1, ['casual', 'winter']),
  J('mod_boutique_ad', 'modelling', 'beginner', 'Boutique Advert', 'Pose in Petal & Thread\'s shop window poster.', 15, 1, ['romantic', 'pastel']),
  J('mod_magazine', 'modelling', 'standard', 'Magazine Photoshoot', 'An editorial spread for "Gloss Weekly".', 30, 2, ['chic', 'elegant']),
  J('mod_runway', 'modelling', 'higher', 'Runway Show', 'Walk the catwalk at Glamour Fashion Week.', 40, 3, ['glam', 'edgy']),
  J('mod_campaign', 'modelling', 'higher', 'Luxury Brand Campaign', 'Be the face of Maison Étoile\'s new season.', 45, 5, ['luxury', 'elegant'], { bonus: 1.15 }),
  J('mod_cover', 'modelling', 'celebrity', 'Celebrity Magazine Cover', 'The cover of "Étoile" magazine. Iconic.', 60, 7, ['glam', 'luxury', 'formal']),
  // Singing
  J('sing_practice', 'singing', 'beginner', 'Singing Practice', 'Warm up those vocals with a coach.', 10, 1, ['casual', 'sporty']),
  J('sing_demo', 'singing', 'beginner', 'Record a Demo Track', 'Lay down your very first demo.', 15, 1, ['street', 'casual']),
  J('sing_studio', 'singing', 'standard', 'Studio Session', 'Record backing vocals for a chart artist.', 30, 2, ['street', 'edgy']),
  J('sing_concert', 'singing', 'higher', 'Small Concert', 'An intimate gig at the Velvet Lounge.', 40, 3, ['glam', 'vintage']),
  J('sing_video', 'singing', 'higher', 'Music Video Shoot', 'Dance, sparkle and lip-sync on set.', 45, 5, ['glam', 'street'], { bonus: 1.15 }),
  J('sing_arena', 'singing', 'celebrity', 'Major Live Performance', 'Headline the Grand Pavilion arena.', 60, 7, ['glam', 'edgy', 'luxury']),
  // Acting
  J('act_audition', 'acting', 'beginner', 'Acting Audition', 'Read lines for a casting director.', 12, 1, ['chic', 'casual']),
  J('act_commercial', 'acting', 'beginner', 'TV Commercial', 'Sell sparkling lemonade with a smile.', 15, 1, ['summer', 'casual']),
  J('act_extra', 'acting', 'standard', 'Television Extra', 'Café customer #3 in a hit drama.', 30, 2, ['casual', 'vintage']),
  J('act_supporting', 'acting', 'higher', 'Supporting Role', 'The best friend with all the best lines.', 40, 3, ['romantic', 'chic']),
  J('act_lead', 'acting', 'higher', 'Leading Role', 'Star in a romantic comedy.', 45, 5, ['romantic', 'elegant'], { bonus: 1.15 }),
  J('act_premiere', 'acting', 'celebrity', 'Movie Premiere', 'Walk the red carpet at your own premiere.', 60, 7, ['formal', 'glam', 'luxury']),
];

export const CAREER_BY_ID = Object.fromEntries(CAREERS.map((c) => [c.id, c]));
export const JOB_BY_ID = Object.fromEntries(JOBS.map((j) => [j.id, j]));

/** Base reward for a job (before style bonus). */
export function jobReward(job) {
  const t = BALANCE.jobs.tiers[job.tier];
  return {
    coins: Math.round(t.coins * job.bonus),
    xp: Math.round(t.xp * job.bonus),
    fame: Math.round(t.fame * job.bonus),
    careerXP: t.careerXP,
  };
}
