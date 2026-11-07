/** PROFILE — celebrity profile card and statistics. */
import { h, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar } from '../components/avatarRenderer.js';
import { addTwinkles } from '../components/sparkles.js';
import { levelProgress, fameTitle } from '../systems/progression.js';
import { wardrobeSize } from '../systems/inventory.js';
import { HAIRSTYLES, MAKEUP, HAIR_COLORS } from '../data/appearance.js';
import { CAREERS } from '../data/careers.js';
import { careerTitle, careerProgress, isCareerUnlocked } from '../systems/careerSystem.js';
import { dailyStatus } from '../systems/dailySystem.js';

export default {
  id: 'profile',
  chrome: 'full',
  title: 'Profile',
  mount(el, params, ctx) {
    const s = ctx.store.get();
    const prog = levelProgress(s);
    const hair = HAIRSTYLES.filter((x) => x.free).length + s.inventory.hairstyles.length;
    const makeup = MAKEUP.filter((x) => x.free && x.color !== null && x.style !== 'none').length + s.inventory.makeup.length;
    const dyes = HAIR_COLORS.filter((x) => x.free).length + s.inventory.hairColors.length;
    const since = new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const card = h('div', { class: 'profile-card' },
      h('div', { class: 'profile-portrait', html: renderAvatar(s.appearance, s.equipped, { viewBox: '30 0 140 300', shadow: false }) }),
      h('div', { class: 'profile-id' },
        h('div', { class: 'script profile-name' }, s.player.name),
        h('div', { class: 'fame-title' }, `✦ ${fameTitle(s.player.fame)} ✦`),
        h('div', { class: 'lvl-line' }, h('b', {}, `Level ${s.player.level}`), h('span', { class: 'muted tiny' }, `${fmt(prog.current)} / ${fmt(prog.need)} XP`)),
        h('div', { class: 'xp-bar big' }, h('i', { style: { width: `${Math.round(prog.ratio * 100)}%` } })),
        h('small', { class: 'muted tiny' }, `Glamour City resident since ${since}`),
      ),
    );
    addTwinkles(card, 8);

    const stat = (value, label, soon) => h('div', { class: 'stat' }, h('b', {}, value), h('span', {}, label), soon ? h('div', { class: 'soon' }, soon) : null);
    el.append(
      h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'Star'), ' Profile'),
        h('button', { class: 'icon-btn dark', 'aria-label': 'Settings', html: icon('gear'), onClick: ctx.openSettings })),
      h('div', { class: 'pad' }, card),
      h('div', { class: 'pad' },
        h('div', { class: 'section-title', html: `${icon('star')}Glamour stats` }),
        h('div', { class: 'stat-grid' },
          stat(fmt(s.player.coins), 'Coins'),
          stat(fmt(s.player.gems), 'Gems'),
          stat(fmt(s.player.fame), 'Fame'),
          stat(fmt(wardrobeSize(s)), 'Wardrobe pieces'),
          stat(`${hair} · ${dyes}`, 'Hairstyles · hair colours'),
          stat(fmt(makeup), 'Makeup products'),
          stat(fmt(s.outfits.length), 'Saved looks'),
          stat(fmt(s.stats.itemsBought), 'Items bought'),
          stat(fmt(s.properties.owned.length), 'Homes owned', 'Starter Apartment'),
          stat('—', 'Relationship status', 'Dating opens in a later update'),
        ),
        h('div', { class: 'section-title', html: `${icon('briefcase')}Careers` }),
        h('div', { class: 'career-stats' }, CAREERS.map((c) => {
          const cs = s.careers[c.id];
          const unlocked = isCareerUnlocked(s, c.id);
          return h('div', { class: 'career-stat', style: { '--c': c.color } },
            h('span', { class: 'cs-ico' }, c.icon),
            h('div', { class: 'cs-body' },
              h('b', {}, `${c.name} · Lv ${cs.level}`),
              h('small', { class: 'muted' }, unlocked ? `${careerTitle(c.id, cs.level)} · ${cs.jobsDone} jobs` : `Unlocks at level ${c.unlockLevel}`),
              h('div', { class: 'xp-bar career' }, h('i', { style: { width: `${Math.round(careerProgress(s, c.id).ratio * 100)}%` } }))));
        })),
        h('div', { class: 'section-title', html: `${icon('crown')}Achievements` }),
        h('div', { class: 'stat-grid' },
          stat(fmt(s.stats.jobsCompleted || 0), 'Jobs completed'),
          stat(fmt(s.stats.promotions || 0), 'Promotions'),
          stat(fmt(s.stats.questsCompleted || 0), 'Quests completed'),
          stat(`${dailyStatus(s).claimedToday ? s.daily.streak : Math.max(0, dailyStatus(s).streak - 1)} days`, 'Login streak'),
          stat(fmt(s.stats.jobCoins || 0), 'Coins earned at work'),
          stat('0', 'Contest wins', 'Pageants arrive in Milestone 3'),
          stat('0', 'Home design awards', 'Decorating arrives in Milestone 4'),
          stat(`${Math.round(s.stats.playSeconds / 60)} min`, 'Time in the city'),
        ),
      ),
    );
  },
};
