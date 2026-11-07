/**
 * Reward celebrations: floating payout, then (in order) level-up, newly unlocked
 * careers and career promotions with the mentor's story beat.
 */
import { h, fmt } from '../utils/dom.js';
import { icon } from './icons.js';
import { CAREER_BY_ID } from '../data/careers.js';
import { BALANCE } from '../data/gameBalance.js';

export function rewardChips(reward = {}) {
  const chips = [];
  if (reward.coins) chips.push(h('span', { class: 'rchip coin', html: `${icon('coin')}+${fmt(reward.coins)}` }));
  if (reward.gems) chips.push(h('span', { class: 'rchip gem', html: `${icon('gem')}+${fmt(reward.gems)}` }));
  if (reward.xp) chips.push(h('span', { class: 'rchip xp' }, `+${fmt(reward.xp)} XP`));
  if (reward.fame) chips.push(h('span', { class: 'rchip fame', html: `${icon('star')}+${fmt(reward.fame)} fame` }));
  return h('div', { class: 'rchips' }, chips);
}

/** Show payout feedback and any follow-up celebrations for a claim result. */
export async function celebrate(ctx, result, { title, from } = {}) {
  if (!result || result.ok === false) return;
  ctx.sfx.play('reward');
  if (from) ctx.sparkleBurst(from, 16);
  if (result.reward?.coins) ctx.floatText(document.querySelector('.pill-coin') || document.body, `+${fmt(result.reward.coins)}`);
  if (title) ctx.toast(title, { type: 'reward' });

  for (const lvl of result.levels || []) {
    const unlocks = Object.values(CAREER_BY_ID).filter((c) => c.unlockLevel === lvl);
    ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 24);
    await ctx.modal.open({
      title: 'Level up!',
      className: 'celebrate',
      body: h('div', { class: 'levelup' },
        h('div', { class: 'big-star', html: `${icon('star')}<b>${lvl}</b>` }),
        h('p', {}, `You reached `, h('b', {}, `level ${lvl}`), '! The city is starting to notice you.'),
        rewardChips(BALANCE.levelUpReward),
        unlocks.map((c) => h('div', { class: 'unlock-note' }, `${c.icon} New career unlocked: `, h('b', {}, c.name), ` at ${c.studio}!`)),
      ),
      buttons: [{ label: 'Amazing!', value: true, cls: 'btn-primary' }],
    });
  }

  for (const p of result.promotions || []) {
    const c = CAREER_BY_ID[p.career];
    ctx.sfx.play('reward');
    await ctx.modal.open({
      title: 'Promotion!',
      className: 'celebrate',
      body: h('div', { class: 'promotion' },
        h('div', { class: 'promo-badge', style: { '--c': c.color } }, h('span', {}, c.icon), h('b', {}, `${c.name} Lv ${p.level}`)),
        h('p', {}, 'You are now a ', h('b', {}, p.title), '!'),
        p.story ? h('blockquote', { class: 'story' }, h('span', { class: 'speaker' }, c.mentor), `“${p.story}”`) : null,
        rewardChips(p.reward),
      ),
      buttons: [{ label: 'Thank you!', value: true, cls: 'btn-gold' }],
    });
  }
}
