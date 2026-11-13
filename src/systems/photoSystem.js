/**
 * PHOTO STUDIO — photos are stored as small specs (look + pose + backdrop + frame + cover),
 * not images, and re-rendered on demand; PNG export rasterises the SVG in the UI.
 * state.photos = [{ id, at, look, pose, backdrop, home?, frame, cover?, fav }]
 */
import { BALANCE } from '../data/gameBalance.js';
import { POSE_BY_ID, BACKDROP_BY_ID, FRAME_BY_ID, MASTHEAD_BY_ID } from '../data/photo.js';
import { dateKey } from '../utils/time.js';
import { grant } from './economy.js';
import { recordEvent } from './questSystem.js';

export function isUnlocked(state, entry) {
  const u = entry?.unlock;
  if (!u) return true;
  if (u.modelling && (state.careers?.modelling?.level || 1) < u.modelling) return false;
  if (u.level && state.player.level < u.level) return false;
  return true;
}

export const unlockText = (entry) => (entry.unlock?.modelling ? `Modelling Lv ${entry.unlock.modelling}` : entry.unlock?.level ? `Level ${entry.unlock.level}` : '');

export function takePhoto(state, spec, now = Date.now()) {
  const pose = POSE_BY_ID[spec.pose];
  const bd = BACKDROP_BY_ID[spec.backdrop];
  const frame = FRAME_BY_ID[spec.frame || 'none'];
  const mast = spec.cover ? MASTHEAD_BY_ID[spec.cover.masthead] : null;
  if (!pose || !bd || !frame || (spec.cover && !mast)) return { ok: false, reason: 'bad-spec' };
  for (const e of [pose, bd, frame, mast].filter(Boolean)) if (!isUnlocked(state, e)) return { ok: false, reason: 'locked', message: `${e.name} unlocks at ${unlockText(e)}` };
  if (bd.kind === 'home' && !state.properties.owned.includes(spec.home?.property)) return { ok: false, reason: 'bad-home' };
  if (!state.photos) state.photos = [];
  if (state.photos.length >= BALANCE.photos.albumMax) return { ok: false, reason: 'album-full' };
  const photo = {
    id: `p${now.toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: now,
    look: { appearance: { ...state.appearance }, equipped: { ...state.equipped } },
    pose: pose.id, backdrop: bd.id, home: bd.kind === 'home' ? { ...spec.home } : null, frame: frame.id,
    cover: spec.cover ? { masthead: mast.id, headline: String(spec.cover.headline || '').slice(0, 60) } : null, fav: false,
  };
  state.photos.push(photo);
  state.stats.photos = (state.stats.photos || 0) + 1;
  if (photo.cover) state.stats.covers = (state.stats.covers || 0) + 1;
  // first photo of the day pays a little fame + XP; a first-ever cover is a moment too
  let reward = null;
  let levels = [];
  const g = grant(state, BALANCE.photos.dailyReward, `photo:${dateKey(now)}`);
  if (g.ok) { reward = { ...BALANCE.photos.dailyReward }; levels = g.levels; }
  if (photo.cover) {
    const c = grant(state, BALANCE.photos.coverReward, 'cover:first');
    if (c.ok) reward = { ...(reward || {}), fame: (reward?.fame || 0) + BALANCE.photos.coverReward.fame };
  }
  recordEvent(state, 'photo', { cover: !!photo.cover }, now);
  return { ok: true, photo, reward, levels };
}

export function deletePhoto(state, id) {
  const i = (state.photos || []).findIndex((p) => p.id === id);
  if (i < 0) return { ok: false, reason: 'unknown' };
  state.photos.splice(i, 1);
  return { ok: true };
}

export function togglePhotoFav(state, id) {
  const p = (state.photos || []).find((x) => x.id === id);
  if (!p) return { ok: false, reason: 'unknown' };
  p.fav = !p.fav;
  return { ok: true };
}
