/**
 * PHOTO STUDIO — poses/angles, backgrounds, frames and fictional magazines.
 * unlock: { modelling: n } → needs Modelling career level n; { level: n } → player level.
 * Backgrounds of kind 'home' use one of your own decorated rooms.
 */
export const POSES = [
  { id: 'classic', name: 'Classic', icon: '🧍‍♀️', view: '0 0 200 440', tilt: 0, flip: false },
  { id: 'over_shoulder', name: 'Over the Shoulder', icon: '💁‍♀️', view: '0 0 200 440', tilt: 0, flip: true },
  { id: 'portrait', name: 'Portrait', icon: '🙂', view: '34 6 132 200', tilt: 0, flip: false },
  { id: 'lean', name: 'Lean In', icon: '↗️', view: '0 0 200 440', tilt: -6, flip: false, unlock: { modelling: 2 } },
  { id: 'beauty', name: 'Beauty Close-up', icon: '💄', view: '52 22 96 104', tilt: 3, flip: false, unlock: { modelling: 3 } },
  { id: 'runway', name: 'Runway Walk', icon: '👠', view: '0 0 200 440', tilt: 4, flip: true, scale: 1.08, unlock: { modelling: 4 } },
  { id: 'editorial', name: 'Editorial Angle', icon: '📐', view: '10 90 180 260', tilt: -10, flip: false, unlock: { modelling: 6 } },
];

export const BACKDROPS = [
  { id: 'studio_pink', name: 'Pink Studio', kind: 'gradient', colors: ['#ffd1e6', '#fff4f9'] },
  { id: 'studio_lilac', name: 'Lilac Studio', kind: 'gradient', colors: ['#e1d0ff', '#fbf7ff'] },
  { id: 'paris', name: 'Paris Street', kind: 'scene', scene: 'paris' },
  { id: 'beach', name: 'Seashell Beach', kind: 'scene', scene: 'beach', unlock: { modelling: 2 } },
  { id: 'runway', name: 'Fashion Week Runway', kind: 'scene', scene: 'runway', unlock: { modelling: 3 } },
  { id: 'starry', name: 'Starry Night', kind: 'scene', scene: 'starry', unlock: { modelling: 5 } },
  { id: 'gold', name: 'Gold Glitter Wall', kind: 'scene', scene: 'gold', unlock: { level: 6 } },
  { id: 'home', name: 'My Home', kind: 'home' },
];

export const FRAMES = [
  { id: 'none', name: 'No Frame' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'gold', name: 'Gold Frame' },
  { id: 'hearts', name: 'Hearts' },
  { id: 'film', name: 'Film Strip', unlock: { modelling: 2 } },
  { id: 'sparkle', name: 'Sparkle Border', unlock: { level: 5 } },
];

/** Original, fictional magazines. */
export const MASTHEADS = [
  { id: 'etoile', name: 'ÉTOILE', color: '#c23477', font: 'serif' },
  { id: 'gloss', name: 'GLOSS Weekly', color: '#2d3d74', font: 'serif' },
  { id: 'gcl', name: 'Glamour City Life', color: '#e3a93d', font: 'script', unlock: { modelling: 3 } },
  { id: 'belle', name: 'BELLE', color: '#111111', font: 'serif', unlock: { modelling: 5 } },
];

export const HEADLINES = [
  'The Rise of {name}', '{name}: My Style Secrets', 'Fashion\'s New Favourite', 'Inside {name}\'s Dream Closet',
  'The It Girl Everyone Is Talking About', '50 Looks to Love This Season', 'Who Wore It Best?', 'Exclusive: {name} Opens Up',
];

export const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const POSE_BY_ID = byId(POSES);
export const BACKDROP_BY_ID = byId(BACKDROPS);
export const FRAME_BY_ID = byId(FRAMES);
export const MASTHEAD_BY_ID = byId(MASTHEADS);
