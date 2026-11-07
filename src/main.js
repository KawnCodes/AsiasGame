/**
 * GLAMOUR CITY — entry point.
 * Boots fonts & styles, loads the save from IndexedDB, wires the router, HUD,
 * autosave and PWA service worker, then shows the welcome screen.
 */
import '@fontsource/quicksand/500.css';
import '@fontsource/quicksand/600.css';
import '@fontsource/quicksand/700.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/parisienne/400.css';
import './styles/main.css';
import './styles/animations.css';
import './styles/screens.css';
import './styles/city.css';
import './styles/wardrobe.css';
import './styles/shopping.css';
import './styles/houses.css';
import './styles/creator.css';
import './styles/careers.css';

import { store } from './systems/gameState.js';
import { loadGame, saveGame } from './systems/saveSystem.js';
import { createRouter } from './components/navigation.js';
import { createHud } from './components/hud.js';
import { initNotifications, toast, sparkleBurst, floatText } from './components/notifications.js';
import { initModal, openModal, confirmModal, promptModal } from './components/modal.js';
import { sfx } from './components/audio.js';
import { openSettings } from './screens/settings.js';

import welcome from './screens/welcome.js';
import creator from './screens/characterCreator.js';
import city from './screens/city.js';
import home from './screens/home.js';
import wardrobe from './screens/wardrobe.js';
import { mall, shop } from './screens/shops.js';
import profile from './screens/profile.js';
import { work, career } from './screens/careers.js';
import quests from './screens/quests.js';
import { ticker } from './components/ticker.js';
import { readyJobs } from './systems/careerSystem.js';
import { claimableCount, questsStale, ensureQuests } from './systems/questSystem.js';
import { dailyStatus } from './systems/dailySystem.js';
import { JOB_BY_ID, CAREER_BY_ID } from './data/careers.js';

const $ = (s) => document.querySelector(s);

async function boot() {
  initNotifications($('#toasts'));
  initModal($('#modal-root'));

  const ctx = {
    store,
    toast,
    sfx,
    sparkleBurst,
    floatText,
    modal: { open: openModal, confirm: confirmModal, prompt: promptModal },
    saveNow: () => (store.get() ? saveGame(store.get()) : Promise.resolve()),
  };
  ctx.openSettings = () => openSettings(ctx);

  const router = createRouter({
    root: $('#screen-root'),
    nav: $('#nav'),
    hud: $('#hud'),
    app: $('#app'),
    screens: { welcome, creator, city, home, wardrobe, mall, shop, profile, work, career, quests },
    ctx,
  });
  ctx.go = router.go;
  ctx.back = router.back;

  // Autosave: debounce routine changes; purchases call ctx.saveNow() immediately.
  let timer = null;
  let hudCleanup = null;
  store.subscribe((s, meta) => {
    if (!s) return;
    applySettings(s.settings);
    if (meta?.label === 'replace' || !hudCleanup) {
      hudCleanup?.();
      hudCleanup = createHud($('#hud'), { store, openSettings: ctx.openSettings, go: router.go });
    }
    clearTimeout(timer);
    timer = setTimeout(() => saveGame(store.get()).catch((e) => toast(`Could not save: ${e.message}`, { type: 'error' })), 400);
  });
  const flush = () => { if (store.get()) saveGame(store.get()); };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  // Tab badges + "job finished" notifications, driven by one shared 1s clock.
  const notified = new Set();
  const refreshBadges = (s, now = Date.now()) => {
    if (!s) return;
    const ready = readyJobs(s, now);
    const running = Object.keys(s.activeJobs || {}).length;
    router.setBadge('work', ready.length || (running ? '•' : 0));
    router.setBadge('quests', claimableCount(s) + (dailyStatus(s, now).claimedToday ? 0 : 1));
  };
  store.subscribe((s) => refreshBadges(s));
  ticker.subscribe((now) => {
    const s = store.get();
    if (!s) return;
    if (questsStale(s, now)) store.transact((d) => { ensureQuests(d, now); }, 'quests-roll');
    for (const a of readyJobs(s, now)) {
      if (notified.has(a.uid)) continue;
      notified.add(a.uid);
      if (router.current !== 'career' && router.current !== 'work' && router.current !== 'welcome') {
        const job = JOB_BY_ID[a.jobId];
        sfx.play('reward');
        toast(`${CAREER_BY_ID[job.career].icon} ${job.name} is done — collect your pay in Work!`, { type: 'reward', duration: 3500 });
      }
    }
    refreshBadges(s, now);
  });

  // Track play time (light-touch; written with the next autosave).
  setInterval(() => {
    if (store.get() && document.visibilityState === 'visible') store.get().stats.playSeconds += 15;
  }, 15000);

  const saved = await loadGame().catch(() => null);
  if (saved) {
    ensureQuests(saved);
    // jobs that finished while the app was closed should not pop a toast on launch
    for (const a of readyJobs(saved)) notified.add(a.uid);
    store.replace(saved);
  }
  $('#screen-root').innerHTML = '';
  router.go('welcome', { hasSave: !!saved }, { replace: true });

  // First user gesture unlocks Web Audio on iOS.
  window.addEventListener('pointerdown', () => sfx.play('tap'), { once: true });
}

function applySettings(settings = {}) {
  sfx.setEnabled(settings.sound !== false);
  document.documentElement.classList.toggle('reduce-motion', !!settings.reducedMotion);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

boot();
