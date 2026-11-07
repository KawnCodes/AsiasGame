/** Promise-based modal dialogs styled as glossy cards with a ribbon title. */
import { h } from '../utils/dom.js';
import { icon } from './icons.js';

let root = null;
export function initModal(el) { root = el; }

/**
 * open({title, body (Node|string), buttons:[{label, value, cls}], dismissable})
 * Resolves with the clicked button's value (or null when dismissed).
 */
export function openModal({ title, body, buttons = [{ label: 'OK', value: true, cls: 'btn-primary' }], dismissable = true, className = '' }) {
  return new Promise((resolve) => {
    const prevFocus = document.activeElement;
    const close = (v) => {
      overlay.classList.remove('in');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { overlay.remove(); prevFocus?.focus?.(); }, 220);
      resolve(v);
    };
    const onKey = (e) => { if (e.key === 'Escape' && dismissable) close(null); };
    const content = typeof body === 'string' ? h('div', { class: 'modal-text', html: body }) : body;
    const card = h('div', { class: `modal-card ${className}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      dismissable ? h('button', { class: 'modal-x', 'aria-label': 'Close', html: icon('close'), onClick: () => close(null) }) : null,
      title ? h('div', { class: 'ribbon' }, h('span', {}, title)) : null,
      h('div', { class: 'modal-body' }, content),
      buttons.length ? h('div', { class: 'modal-actions' }, buttons.map((b) => h('button', { class: `btn ${b.cls || 'btn-soft'}`, onClick: () => close(b.value) }, b.label))) : null,
    );
    const overlay = h('div', { class: 'modal-overlay', onClick: (e) => { if (e.target === overlay && dismissable) close(null); } }, card);
    root.append(overlay);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => { overlay.classList.add('in'); card.querySelector('.modal-actions .btn:last-child, .modal-x')?.focus(); });
    // expose close for custom bodies
    card.closeModal = close;
  });
}

export const confirmModal = (title, html, okLabel = 'Yes', cancelLabel = 'Not now') =>
  openModal({ title, body: html, buttons: [{ label: cancelLabel, value: false, cls: 'btn-soft' }, { label: okLabel, value: true, cls: 'btn-primary' }] });

export function promptModal(title, { placeholder = '', value = '', okLabel = 'Save', maxLength = 24 } = {}) {
  const input = h('input', { class: 'text-input', placeholder, maxlength: maxLength, value });
  const body = h('div', {}, input);
  setTimeout(() => input.focus(), 250);
  return openModal({ title, body, buttons: [{ label: 'Cancel', value: false }, { label: okLabel, value: true, cls: 'btn-primary' }] })
    .then((ok) => (ok ? input.value : null));
}
