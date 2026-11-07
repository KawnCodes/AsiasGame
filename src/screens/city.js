/** CITY MAP — scrollable illustrated city; tap buildings to visit them. */
import { h } from '../utils/dom.js';
import { LOCATIONS, DISTRICTS } from '../data/locations.js';
import { MAP_W, MAP_H, locationSVG, groundSVG } from '../components/art/cityArt.js';
import { addTwinkles } from '../components/sparkles.js';

let savedScroll = 0;

export default {
  id: 'city',
  chrome: 'full',
  title: 'City map',
  mount(el, params, ctx) {
    const svg = `<svg class="city-svg" viewBox="0 0 ${MAP_W} ${MAP_H}" xmlns="http://www.w3.org/2000/svg">
      ${groundSVG(DISTRICTS)}
      ${LOCATIONS.map((l) => locationSVG(l, ctx.store.get().player.level)).join('')}
    </svg>`;
    const map = h('div', { class: 'city-map', html: svg });
    addTwinkles(map, 14, ['#fff', '#ffd36e', '#ff9fc6']);
    const jump = h('div', { class: 'district-jump chips' },
      DISTRICTS.map((d) => h('button', { class: 'chip', onClick: () => scrollToDistrict(d) }, d.name)));
    el.append(jump, map);

    function scrollToDistrict(d) {
      const scale = map.clientWidth / MAP_W;
      el.scrollTo({ top: d.y * scale, behavior: 'smooth' });
    }

    function activate(id) {
      const loc = LOCATIONS.find((l) => l.id === id);
      if (!loc) return;
      const g = map.querySelector(`[data-id="${id}"]`);
      g?.classList.add('tapped');
      setTimeout(() => g?.classList.remove('tapped'), 300);
      if (loc.status !== 'open') {
        ctx.sfx.play('error');
        ctx.toast(`${loc.name} opens in the ${loc.soon}.`, { iconName: 'lock' });
        return;
      }
      const need = loc.requires?.level || 1;
      if (ctx.store.get().player.level < need) {
        ctx.sfx.play('error');
        ctx.toast(`${loc.name} opens its doors at level ${need}. Keep working!`, { iconName: 'lock' });
        return;
      }
      ctx.sfx.play('tap');
      savedScroll = el.scrollTop;
      if (loc.action.type === 'screen') ctx.go(loc.action.screen, loc.action.params || {});
      else if (loc.action.type === 'shop') ctx.go('shop', { shopId: loc.action.shop });
      else if (loc.action.type === 'career') ctx.go('career', { career: loc.action.career });
    }

    map.addEventListener('click', (e) => {
      const g = e.target.closest('.loc');
      if (g) activate(g.dataset.id);
    });
    map.addEventListener('keydown', (e) => {
      const g = e.target.closest('.loc');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(g.dataset.id); }
    });

    requestAnimationFrame(() => { el.scrollTop = savedScroll; });

    const s = ctx.store.get();
    if (!s.flags.cityHintSeen) {
      setTimeout(() => ctx.toast('Tap any building to step inside ✨', { duration: 3800 }), 400);
      ctx.store.transact((d) => { d.flags.cityHintSeen = true; }, 'flag');
    }
  },
};
