/** Ambient twinkles scattered over a container. */
import { h } from '../utils/dom.js';

const STAR = '<svg viewBox="0 0 24 24"><path d="M12 1l2.2 7.8L22 11l-7.8 2.2L12 21l-2.2-7.8L2 11l7.8-2.2z"/></svg>';

export function addTwinkles(container, count = 10, colors = ['#fff', '#ffe08a', '#ffc4e0']) {
  const layer = h('div', { class: 'stage-sparkles', 'aria-hidden': 'true' });
  for (let i = 0; i < count; i++) {
    const t = h('span', { class: 'twinkle', html: STAR });
    t.style.left = `${Math.random() * 92}%`;
    t.style.top = `${Math.random() * 88}%`;
    t.style.animationDelay = `${(Math.random() * 2.6).toFixed(2)}s`;
    t.style.color = colors[i % colors.length];
    const s = 8 + Math.random() * 10;
    t.style.width = t.style.height = `${s}px`;
    layer.append(t);
  }
  container.append(layer);
  return layer;
}
