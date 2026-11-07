/** QUESTS — daily gift, daily / weekly / story quests with progress and claims. */
import { h, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { ticker } from '../components/ticker.js';
import { celebrate, rewardChips } from '../components/rewards.js';
import { openDaily } from '../components/dailyReward.js';
import { listQuests, claimQuest, ensureQuests, questsStale } from '../systems/questSystem.js';
import { dailyStatus } from '../systems/dailySystem.js';
import { formatDuration, msUntilMidnight } from '../utils/time.js';

let lastTab = 'daily';

function msUntilMonday(now) {
  const d = new Date(now);
  const daysLeft = (8 - d.getDay()) % 7 || 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysLeft).getTime() - now;
}

export default {
  id: 'quests',
  chrome: 'full',
  title: 'Quests',
  mount(el, params, ctx) {
    let tab = params.tab || lastTab;
    if (questsStale(ctx.store.get())) ctx.store.transact((d) => { ensureQuests(d); }, 'quests-roll');

    const giftCard = h('button', { class: 'gift-card', onClick: () => openDaily(ctx) });
    const tabs = h('div', { class: 'chips seg' });
    const resetNote = h('div', { class: 'muted tiny reset-note' });
    const list = h('div', { class: 'quest-list' });
    el.append(h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'Star'), ' Quests')), h('div', { class: 'pad' }, giftCard), tabs, resetNote, list);

    function renderGift(s) {
      const st = dailyStatus(s);
      giftCard.className = `gift-card ${st.claimedToday ? 'claimed' : 'ready'}`;
      giftCard.innerHTML = '';
      giftCard.append(
        h('span', { class: 'gift-ico' }, '🎁'),
        h('div', { class: 'gift-text' }, h('b', {}, st.claimedToday ? 'Daily gift claimed' : 'Your daily gift is ready!'),
          h('small', {}, st.claimedToday ? `Streak: ${st.streak} day${st.streak === 1 ? '' : 's'} · next gift tomorrow` : `Day ${st.dayIndex + 1}: ${fmt(st.reward.coins)} coins + ${st.reward.gems} gems`)),
        h('span', { class: 'gift-go' }, st.claimedToday ? '✓' : 'Open'),
      );
    }

    function renderTabs(s) {
      tabs.innerHTML = '';
      for (const [id, label] of [['daily', 'Daily'], ['weekly', 'Weekly'], ['story', 'Milestones']]) {
        const n = listQuests(s, id).filter((q) => q.done && !q.claimed).length;
        tabs.append(h('button', { class: `chip ${tab === id ? 'active' : ''}`, onClick: () => { tab = lastTab = id; ctx.sfx.play('tap'); render(); } }, label, n ? h('span', { class: 'count' }, n) : null));
      }
    }

    function renderReset() {
      const now = Date.now();
      resetNote.textContent = tab === 'daily' ? `New daily quests in ${formatDuration(msUntilMidnight(now))}`
        : tab === 'weekly' ? `New weekly quests in ${formatDuration(msUntilMonday(now))}` : 'Long-term goals — complete them at your own pace.';
    }

    function renderList(s) {
      list.innerHTML = '';
      let quests = listQuests(s, tab);
      if (tab === 'story') quests = [...quests].sort((a, b) => (a.claimed - b.claimed) || (b.done - a.done));
      for (const q of quests) {
        const pct = Math.round((q.value / q.target) * 100);
        list.append(h('div', { class: `quest ${q.claimed ? 'claimed' : q.done ? 'done' : ''}` },
          h('div', { class: 'q-main' },
            h('div', { class: 'q-title' }, h('b', {}, q.def.title), q.def.category ? h('span', { class: 'tag' }, q.def.category) : null),
            h('div', { class: 'muted tiny' }, q.def.text),
            h('div', { class: 'q-bar' }, h('i', { style: { width: `${pct}%` } }), h('span', {}, `${fmt(q.value)} / ${fmt(q.target)}`)),
            rewardChips(q.def.reward),
          ),
          q.claimed ? h('span', { class: 'q-state', html: icon('check') })
            : h('button', { class: `btn btn-small ${q.done ? 'btn-gold pulse' : 'btn-soft'}`, disabled: !q.done, onClick: (e) => claim(q, e.currentTarget) }, q.done ? 'Claim' : `${pct}%`),
        ));
      }
    }

    async function claim(q, btn) {
      const r = ctx.store.transact((d) => claimQuest(d, q.scope, q.def.id), 'quest');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'expired' ? 'That quest has expired.' : 'Not complete yet!', { type: 'error' }); return; }
      await ctx.saveNow();
      await celebrate(ctx, r, { title: `Quest complete: ${q.def.title}`, from: btn });
    }

    function render() {
      const s = ctx.store.get();
      renderGift(s); renderTabs(s); renderReset(); renderList(s);
    }
    render();
    const unsub = ctx.store.subscribe((s) => s && render());
    const unsubTick = ticker.subscribe(() => {
      renderReset();
      if (questsStale(ctx.store.get())) ctx.store.transact((d) => { ensureQuests(d); }, 'quests-roll');
    });
    return () => { unsub(); unsubTick(); };
  },
};
