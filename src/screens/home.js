/** HOME — the player's starter apartment and main hub. */
import { h, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar } from '../components/avatarRenderer.js';
import { roomSVG, HOTSPOTS, ROOM_W, ROOM_H } from '../components/art/roomArt.js';
import { addTwinkles } from '../components/sparkles.js';
import { wardrobeSize } from '../systems/inventory.js';
import { maybeShowDaily, openDaily } from '../components/dailyReward.js';
import { readyJobs } from '../systems/careerSystem.js';
import { claimableCount } from '../systems/questSystem.js';
import { dailyStatus } from '../systems/dailySystem.js';
import { THEME_BY_ID } from '../data/competitions.js';
import { BALANCE } from '../data/gameBalance.js';

export default {
  id: 'home',
  chrome: 'full',
  title: 'My apartment',
  mount(el, params, ctx) {
    const room = h('div', { class: 'room', style: { aspectRatio: `${ROOM_W} / ${ROOM_H}` } });
    const avatar = h('div', { class: 'room-avatar avatar-idle' });
    const hotspots = h('div', { class: 'hotspots' });
    room.append(h('div', { class: 'room-bg' }), avatar, hotspots);
    addTwinkles(room, 6);

    const actions = {
      wardrobe: () => ctx.go('wardrobe'),
      vanity: () => ctx.go('creator', { mode: 'edit', tab: 'makeup' }),
      mirror: () => ctx.go('creator', { mode: 'edit', tab: 'hair' }),
      bed: rest,
      gift: () => openDaily(ctx),
      trophies: () => showTrophies(ctx),
    };
    for (const hs of HOTSPOTS) {
      hotspots.append(h('button', {
        class: 'hotspot', style: { left: `${(hs.x / ROOM_W) * 100}%`, top: `${(hs.y / ROOM_H) * 100}%` },
        'aria-label': hs.label,
        onClick: () => { ctx.sfx.play('tap'); actions[hs.id](); },
        html: `<span class="hs-dot">${icon('sparkle')}</span><span class="hs-label">${hs.label}</span>`,
      }));
    }

    const info = h('div', { class: 'home-panel' });
    el.append(h('div', { class: 'home-title' }, h('span', { class: 'script' }, 'Home'), ' sweet home', h('small', {}, 'Starter Apartment · Rosewood Street')), room, info);

    function render(s) {
      room.querySelector('.room-bg').innerHTML = roomSVG(s);
      avatar.innerHTML = renderAvatar(s.appearance, s.equipped);
      info.innerHTML = '';
      info.append(
        h('div', { class: 'quick-grid' },
          quick('briefcase', 'Go to work', workLine(s), () => ctx.go('work'), readyJobs(s).length > 0),
          quick('scroll', 'Quests', questLine(s), () => ctx.go('quests'), claimableCount(s) > 0 || !dailyStatus(s).claimedToday),
          quick('hanger', 'Wardrobe', `${wardrobeSize(s)} pieces`, () => ctx.go('wardrobe')),
          quick('bag', 'Go shopping', '7 shops open', () => ctx.go('mall')),
          quick('crown', 'Fashion contests', contestLine(s), () => ctx.go('pavilion')),
          quick('star', 'My profile', `Level ${s.player.level} · ${fmt(s.player.fame)} fame`, () => ctx.go('profile')),
        ),
        h('div', { class: 'panel tip' },
          h('div', { class: 'section-title', html: `${icon('star')}Star tip` }),
          h('p', { class: 'muted' }, tipFor(s)),
        ),
      );
    }

    function quick(ic, title, sub, fn, alert = false) {
      return h('button', { class: `quick ${alert ? 'alert' : ''}`, onClick: () => { ctx.sfx.play('tap'); fn(); } },
        h('span', { class: 'quick-ico', html: icon(ic) }), h('b', {}, title), h('small', {}, sub));
    }

    async function rest() {
      room.classList.add('night');
      await ctx.saveNow();
      setTimeout(() => {
        room.classList.remove('night');
        ctx.toast('Sweet dreams! Your progress is saved. 🌙', { type: 'success' });
      }, 1300);
    }

    render(ctx.store.get());
    const unsub = ctx.store.subscribe((s) => s && render(s));

    if (params.firstTime) {
      const s = ctx.store.get();
      setTimeout(() => {
        ctx.sfx.play('reward');
        ctx.modal.open({
          title: 'Welcome!',
          body: h('div', { class: 'welcome-gift' },
            h('p', {}, 'Welcome to ', h('b', {}, 'Glamour City'), `, ${s.player.name}! This cosy apartment is all yours.`),
            h('div', { class: 'gift-row' },
              h('div', { class: 'gift', html: `${icon('coin')}<b>${fmt(s.player.coins)}</b><span>coins</span>` }),
              h('div', { class: 'gift', html: `${icon('gem')}<b>${fmt(s.player.gems)}</b><span>gems</span>` }),
            ),
            h('p', { class: 'muted tiny' }, 'Head to Boutique Avenue to treat yourself, then style your look in the wardrobe!'),
          ),
          buttons: [{ label: "Let's go shopping!", value: 'shop', cls: 'btn-primary' }],
        }).then((v) => { if (v === 'shop') ctx.go('mall'); else maybeShowDaily(ctx); });
        ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 22);
      }, 450);
    }
    if (!params.firstTime) maybeShowDaily(ctx);
    return unsub;
  },
};

function contestLine(s) {
  const c = s.contests;
  return c?.entries ? `${c.wins} win${c.wins === 1 ? '' : 's'} · ${(s.trophies || []).length} trophies` : 'Grand Pavilion is open!';
}

function showTrophies(ctx) {
  const s = ctx.store.get();
  const list = [...(s.trophies || [])].sort((a, b) => b.at - a.at);
  const medal = ['', '🥇', '🥈', '🥉'];
  const body = list.length
    ? h('div', { class: 'trophy-list' }, list.slice(0, 30).map((t) => h('div', { class: 'hist' },
      h('span', { class: 'hist-place' }, medal[t.place]),
      h('span', { class: 'hist-name' }, `${THEME_BY_ID[t.theme]?.name || t.theme} · ${BALANCE.contests.tiers[t.tier]?.name || ''}`),
      h('small', { class: 'muted' }, new Date(t.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })))))
    : h('p', {}, 'No trophies yet. Place in the top 3 at the Grand Pavilion to win one!');
  ctx.modal.open({ title: `Trophies (${list.length})`, body, buttons: [{ label: 'Go to the Pavilion', value: true, cls: 'btn-primary' }] })
    .then((v) => { if (v) ctx.go('pavilion'); });
}

function workLine(s) {
  const ready = readyJobs(s).length;
  if (ready) return `${ready} job${ready > 1 ? 's' : ''} ready to collect!`;
  const running = Object.keys(s.activeJobs).length;
  return running ? `${running} job${running > 1 ? 's' : ''} in progress` : 'Earn coins, XP & fame';
}

function questLine(s) {
  const n = claimableCount(s);
  if (!dailyStatus(s).claimedToday) return 'Daily gift waiting! 🎁';
  return n ? `${n} reward${n > 1 ? 's' : ''} to claim` : 'Daily, weekly & milestones';
}

function tipFor(s) {
  if (s.player.level >= 2 && !s.contests?.entries) return 'The Grand Pavilion is open! Enter a fashion contest — even 4th place pays 200 coins.';
  if (!s.stats.jobsCompleted) return 'Head to Work and take a quick catalogue shoot — jobs take seconds and pay coins, XP and fame.';
  if (s.player.level < 3) return 'Wear pieces that match a job\'s style tags for a +25% style bonus. Singing unlocks at level 2, acting at level 3!';
  if (s.stats.itemsBought === 0) return 'Your closet is a little bare — Petal & Thread on Boutique Avenue has cute pieces from just 100 coins.';
  if (s.outfits.length === 0) return 'Love your outfit? Tap "Save look" in the wardrobe to keep it for later.';
  if (s.stats.itemsBought < 8) return 'Run all three careers at once — one job per studio — and check Quests for bonus rewards.';
  return 'Try a new hairstyle at Silk & Curl Salon, then show it off in the mirror!';
}
