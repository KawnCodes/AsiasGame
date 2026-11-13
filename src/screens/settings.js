/** SETTINGS — sound, motion, save backup export/import and reset. */
import { h } from '../utils/dom.js';
import { exportSave, importSave, saveGame, deleteSave } from '../systems/saveSystem.js';

export function openSettings(ctx) {
  const s = ctx.store.get();
  if (!s) return;
  const toggle = (label, key, sub) => {
    const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!ctx.store.get().settings[key]), 'aria-label': label });
    sw.addEventListener('click', () => {
      ctx.store.transact((d) => { d.settings[key] = !d.settings[key]; }, 'settings');
      sw.setAttribute('aria-checked', String(!!ctx.store.get().settings[key]));
      ctx.sfx.play('tap');
    });
    return h('div', { class: 'toggle-row' }, h('div', { class: 'left' }, h('b', {}, label), sub ? h('div', { class: 'muted tiny' }, sub) : null), sw);
  };

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const next = importSave(await file.text());
      const ok = await ctx.modal.confirm('Restore backup?', `<p>Load <b>${next.player.name}</b> (level ${next.player.level})? Your current progress will be replaced.</p>`, 'Restore', 'Cancel');
      if (!ok) return;
      fileInput.closest('.modal-card')?.closeModal(true);
      ctx.store.replace(next);
      await saveGame(next);
      ctx.toast('Backup restored!', { type: 'success' });
      ctx.go('home');
    } catch (e) {
      ctx.toast(e.message, { type: 'error', duration: 4000 });
    } finally { fileInput.value = ''; }
  });

  const exportBtn = h('button', {
    class: 'btn btn-soft btn-small', onClick: () => {
      const blob = new Blob([exportSave(ctx.store.get())], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `glamour-city-${ctx.store.get().player.name.replace(/\W+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      ctx.toast('Backup downloaded ✨', { type: 'success' });
    },
  }, 'Export backup');
  const importBtn = h('button', { class: 'btn btn-soft btn-small', onClick: () => fileInput.click() }, 'Import backup');
  const resetBtn = h('button', {
    class: 'btn btn-soft btn-small danger', onClick: async () => {
      const ok = await ctx.modal.confirm('Start over?', '<p>This permanently deletes your star and all progress on this device.</p>', 'Delete everything', 'Cancel');
      if (!ok) return;
      resetBtn.closest('.modal-card')?.closeModal(true);
      await deleteSave();
      ctx.store.replace(null);
      ctx.go('welcome', {}, { replace: true });
    },
  }, 'Start over');

  const body = h('div', { class: 'settings' },
    toggle('Sound effects', 'sound'),
    toggle('Reduce motion', 'reducedMotion', 'Calmer screen transitions & sparkles'),
    h('div', { class: 'settings-block' }, h('b', {}, 'Save data'), h('p', { class: 'muted tiny' }, 'Your game saves automatically on this device. Export a backup file to keep it safe or move it to another device.'), h('div', { class: 'btn-row wrap' }, exportBtn, importBtn), fileInput),
    h('div', { class: 'settings-block' }, resetBtn),
    h('p', { class: 'muted tiny' }, 'Glamour City v0.6 · Milestone 6 · works offline once installed'),
  );
  ctx.modal.open({ title: 'Settings', body, buttons: [{ label: 'Done', value: true, cls: 'btn-primary' }] });
}
