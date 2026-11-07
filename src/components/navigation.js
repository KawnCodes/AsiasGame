/**
 * NAVIGATION — screen router with animated transitions, plus the bottom tab bar.
 *
 * A screen module exports `{ id, chrome, mount(el, params, ctx) }`:
 *   chrome: 'full' (HUD + tab bar) | 'hud' (HUD only) | 'none' (welcome / creator)
 *   mount returns an optional cleanup function.
 */
import { h } from '../utils/dom.js';
import { icon } from './icons.js';
import { sfx } from './audio.js';

const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'city', label: 'City', icon: 'city' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'quests', label: 'Quests', icon: 'scroll' },
  { id: 'wardrobe', label: 'Closet', icon: 'hanger' },
  { id: 'mall', label: 'Shops', icon: 'bag' },
];

export function createRouter({ root, nav, hud, app, screens, ctx }) {
  let current = null; // { id, el, cleanup }
  const history = [];

  const tabButtons = TABS.map((t) =>
    h('button', { class: 'tab', dataset: { tab: t.id }, 'aria-label': t.label, html: `${icon(t.icon)}<span>${t.label}</span><i class="tab-badge" hidden></i>`, onClick: () => go(t.id) }));
  nav.append(...tabButtons);

  function setChrome(chrome, id) {
    app.dataset.chrome = chrome;
    hud.hidden = chrome === 'none';
    nav.hidden = chrome !== 'full';
    const tabFor = { shop: 'mall', creator: 'home', career: 'work', profile: 'home', pavilion: 'city', contest: 'city', agency: 'home', homes: 'home', decorate: 'home', fshop: 'mall', venue: 'city', person: 'city', phone: 'home' }[id] || id;
    tabButtons.forEach((b) => b.classList.toggle('active', b.dataset.tab === tabFor));
  }

  function go(id, params = {}, { replace = false, back = false } = {}) {
    const screen = screens[id];
    if (!screen) throw new Error(`Unknown screen ${id}`);
    if (current && !replace && !back) history.push({ id: current.id, params: current.params });
    if (history.length > 30) history.shift();
    sfx.play('page');
    const el = h('section', { class: `screen screen-${id}`, 'aria-label': screen.title || id });
    const old = current;
    setChrome(screen.chrome || 'full', id);
    root.append(el);
    current = { id, el, params, cleanup: null };
    try {
      current.cleanup = screen.mount(el, params, ctx) || null;
    } catch (e) {
      console.error(e);
      el.append(h('div', { class: 'panel' }, 'Oops — this screen hit a snag. ', h('button', { class: 'btn btn-primary', onClick: () => go('home') }, 'Go home')));
    }
    el.classList.add(back ? 'enter-back' : 'enter');
    if (old) {
      old.cleanup?.();
      old.el.classList.add(back ? 'leave-back' : 'leave');
      setTimeout(() => old.el.remove(), 320);
    }
    root.scrollTop = 0;
  }

  function goBack(fallback = 'home') {
    const prev = history.pop();
    if (prev) go(prev.id, prev.params, { back: true });
    else go(fallback, {}, { back: true });
  }

  /** Show a number (or dot for true) on a tab; falsy hides it. */
  function setBadge(tabId, value) {
    const b = tabButtons.find((x) => x.dataset.tab === tabId)?.querySelector('.tab-badge');
    if (!b) return;
    b.hidden = !value;
    b.textContent = value === true ? '' : String(value || '');
  }

  return { go, back: goBack, setBadge, get current() { return current?.id; } };
}
