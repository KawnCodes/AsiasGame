/** DAILY GIFT — 7-day streak calendar modal with a claim button. */
import { h, fmt } from '../utils/dom.js';
import { icon } from './icons.js';
import { dailyStatus, claimDaily } from '../systems/dailySystem.js';
import { celebrate } from './rewards.js';
import { formatDuration, msUntilMidnight } from '../utils/time.js';

let shownThisSession = false;

/** Auto-open once per app session when the gift is available. */
export function maybeShowDaily(ctx) {
  const s = ctx.store.get();
  if (shownThisSession || !s || dailyStatus(s).claimedToday) return;
  shownThisSession = true;
  setTimeout(() => openDaily(ctx), 500);
}

export function openDaily(ctx) {
  const st = dailyStatus(ctx.store.get());
  const tiles = st.table.map((r, i) => {
    const past = st.claimedToday ? i <= st.dayIndex : i < st.dayIndex;
    const today = i === st.dayIndex;
    return h('div', { class: `day-tile ${past ? 'done' : ''} ${today && !st.claimedToday ? 'today' : ''} ${i === 6 ? 'grand' : ''}` },
      h('small', {}, `Day ${i + 1}`),
      h('span', { class: 'dt-ico', html: icon(i === 6 ? 'gem' : 'coin') }),
      h('b', {}, fmt(r.coins)),
      h('span', { class: 'dt-gems' }, `+${r.gems} 💎`),
      past ? h('span', { class: 'dt-check', html: icon('check') }) : null,
    );
  });
  const body = h('div', { class: 'daily' },
    h('p', { class: 'muted tiny' }, st.claimedToday
      ? `Come back tomorrow for day ${(st.dayIndex + 1) % 7 + 1}! Next gift in ${formatDuration(msUntilMidnight(Date.now()))}.`
      : st.brokeStreak ? 'Your streak restarted — log in every day to reach the Day 7 jackpot!' : `Day ${st.dayIndex + 1} of your streak — keep it going for the Day 7 jackpot!`),
    h('div', { class: 'day-grid' }, tiles),
  );
  const buttons = st.claimedToday ? [{ label: 'See you tomorrow', value: false, cls: 'btn-soft' }] : [{ label: `Claim ${fmt(st.reward.coins)} coins + ${st.reward.gems} gems`, value: true, cls: 'btn-gold' }];
  return ctx.modal.open({ title: 'Daily Gift', body, buttons, className: 'wide' }).then(async (ok) => {
    if (!ok) return;
    const r = ctx.store.transact((d) => claimDaily(d), 'daily');
    if (r.ok === false) { ctx.toast('Already claimed today!', { type: 'error' }); return; }
    await ctx.saveNow();
    await celebrate(ctx, r, { title: `Day ${r.day} gift claimed!`, from: { x: window.innerWidth / 2, y: window.innerHeight / 2 } });
  });
}
