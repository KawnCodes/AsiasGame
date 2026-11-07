/** Toasts, floating reward text and sparkle bursts. */
import { h } from '../utils/dom.js';
import { icon } from './icons.js';

let root = null;
export function initNotifications(el) { root = el; }

export function toast(message, { type = 'info', iconName, duration = 2400 } = {}) {
  if (!root) return;
  // keep at most two toasts on screen: the newest message wins
  const live = [...root.querySelectorAll('.toast:not(.out)')];
  while (live.length >= 2) { const old = live.shift(); old.classList.add('out'); setTimeout(() => old.remove(), 300); }
  const ic = iconName || { success: 'check', error: 'close', reward: 'sparkle', info: 'heart' }[type] || 'heart';
  const t = h('div', { class: `toast toast-${type}`, role: 'status', html: `${icon(ic)}<span></span>` });
  t.querySelector('span').textContent = message;
  root.append(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); t.classList.add('out'); setTimeout(() => t.remove(), 400); }, duration);
}

/** Sparkle burst at a screen point (or element centre). */
export function sparkleBurst(target, count = 14) {
  if (document.documentElement.classList.contains('reduce-motion')) return;
  let x, y;
  if (target instanceof Element) {
    const r = target.getBoundingClientRect();
    x = r.left + r.width / 2; y = r.top + r.height / 2;
  } else ({ x, y } = target);
  const colors = ['#ff7eb6', '#ffd36e', '#c9a7ff', '#ffffff', '#7ce0ff'];
  for (let i = 0; i < count; i++) {
    const s = h('span', { class: 'spark', html: '<svg viewBox="0 0 24 24"><path d="M12 1l2.2 7.8L22 11l-7.8 2.2L12 21l-2.2-7.8L2 11l7.8-2.2z"/></svg>' });
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 60;
    s.style.left = `${x}px`; s.style.top = `${y}px`;
    s.style.setProperty('--dx', `${Math.cos(a) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * dist}px`);
    s.style.color = colors[i % colors.length];
    s.style.setProperty('--s', (0.5 + Math.random() * 0.8).toFixed(2));
    document.body.append(s);
    setTimeout(() => s.remove(), 900);
  }
}

/** Floating "+500" style text. */
export function floatText(target, text, cls = '') {
  const r = target.getBoundingClientRect();
  const f = h('div', { class: `float-text ${cls}` }, text);
  f.style.left = `${r.left + r.width / 2}px`;
  f.style.top = `${r.top}px`;
  document.body.append(f);
  setTimeout(() => f.remove(), 1200);
}
