/** Top HUD: level badge + XP bar, coins, gems and settings. Always reflects store state. */
import { h, fmt } from '../utils/dom.js';
import { icon } from './icons.js';
import { levelProgress } from '../systems/progression.js';

export function createHud(el, { store, openSettings, go }) {
  el.innerHTML = '';
  const level = h('div', { class: 'lvl-badge', html: `${icon('star')}<b>1</b>` });
  const name = h('div', { class: 'hud-name' });
  const bar = h('div', { class: 'xp-bar' }, h('i'));
  const xpText = h('div', { class: 'xp-text' });
  const coins = h('div', { class: 'pill pill-coin', 'aria-label': 'Coins', html: `${icon('coin')}<b>0</b>` });
  const gems = h('div', { class: 'pill pill-gem', 'aria-label': 'Gems', html: `${icon('gem')}<b>0</b>` });
  const gear = h('button', { class: 'icon-btn', 'aria-label': 'Settings', html: icon('gear'), onClick: openSettings });
  const phoneBtn = h('button', { class: 'icon-btn phone-btn', 'aria-label': 'Phone', html: `${icon('phone')}<i class="tab-badge" hidden></i>`, onClick: () => go('phone') });
  el.append(
    h('button', { class: 'hud-left', 'aria-label': 'Open profile', onClick: () => go('profile') }, level, h('div', { class: 'hud-meta' }, name, bar, xpText)),
    h('div', { class: 'hud-right' }, coins, gems, phoneBtn, gear),
  );

  let last = { coins: null, gems: null, level: null };
  const bump = (node) => { node.classList.remove('bump'); void node.offsetWidth; node.classList.add('bump'); };

  function render(s) {
    if (!s) return;
    const p = s.player;
    const prog = levelProgress(s);
    level.querySelector('b').textContent = p.level;
    name.textContent = p.name;
    bar.firstChild.style.width = `${Math.round(prog.ratio * 100)}%`;
    xpText.textContent = `${fmt(prog.current)} / ${fmt(prog.need)} XP`;
    if (last.coins !== null && p.coins !== last.coins) bump(coins);
    if (last.gems !== null && p.gems !== last.gems) bump(gems);
    if (last.level !== null && p.level !== last.level) bump(level);
    coins.querySelector('b').textContent = fmt(p.coins);
    gems.querySelector('b').textContent = fmt(p.gems);
    last = { coins: p.coins, gems: p.gems, level: p.level };
  }
  render(store.get());
  return store.subscribe((s) => render(s));
}
