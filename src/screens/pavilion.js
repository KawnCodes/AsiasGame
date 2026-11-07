/**
 * GRAND PAVILION — fashion contests.
 *   pavilion : lobby with the contest board, theme of the day, stats & guest judging
 *   contest  : dressing room → runway show → judges' panel → results & prizes
 */
import { h, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar, renderItemThumb } from '../components/avatarRenderer.js';
import { itemCard } from '../components/itemCard.js';
import { addTwinkles } from '../components/sparkles.js';
import { celebrate, rewardChips } from '../components/rewards.js';
import { runwaySVG } from '../components/art/runwayArt.js';
import { THEME_BY_ID, JUDGES, CATEGORIES } from '../data/competitions.js';
import { BALANCE } from '../data/gameBalance.js';
import { CLOTHING_BY_ID, CATEGORIES as CLOTHING_CATEGORIES } from '../data/clothing.js';
import { HAIRSTYLES, HAIR_COLORS, MAKEUP } from '../data/appearance.js';
import {
  ensureBoard, submitEntry, prizeFor, spotlightTheme, tierAvailable, tagFit, canEnter, wornItems,
  ensureJudgeRound, answerJudgeRound,
} from '../systems/competitionSystem.js';
import { toggleEquip, isEquipped, owns, setAppearance } from '../systems/inventory.js';

const JUDGE_BY_ID = Object.fromEntries(JUDGES.map((j) => [j.id, j]));
const PLACE = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];
const MEDAL = ['', '🥇', '🥈', '🥉'];

function palette(theme) {
  return h('div', { class: 'palette' }, theme.palette.map((c) => h('span', { style: { background: c } })));
}
function wanted(theme) {
  return h('div', { class: 'tags' }, Object.entries(theme.styles).sort((a, b) => b[1] - a[1]).map(([t]) => h('span', { class: 'tag' }, t)));
}

// ================================================================== lobby
export const pavilion = {
  id: 'pavilion',
  chrome: 'full',
  title: 'Grand Pavilion',
  mount(el, params, ctx) {
    if (ensureBoardNeeded()) ctx.store.transact((d) => { ensureBoard(d); }, 'board');
    function ensureBoardNeeded() { const s = ctx.store.get(); return s.contests.board.length < BALANCE.contests.boardSize || !s.contests.board.some((b) => b.theme === spotlightTheme()); }

    const body = h('div');
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('city'), html: `${icon('back')}City` }), h('h2', {}, h('span', { class: 'script' }, 'Grand'), ' Pavilion')),
      body,
    );

    function render() {
      const s = ctx.store.get();
      const c = s.contests;
      const spot = spotlightTheme();
      body.innerHTML = '';
      const hero = h('div', { class: 'pav-hero' },
        h('div', { class: 'pav-judges' }, JUDGES.map((j) => h('div', { class: 'pj', html: renderAvatar(j.look.appearance, j.look.equipped, { viewBox: '46 8 108 120', shadow: false, align: 'xMidYMid', label: j.name }) }))),
        h('div', { class: 'pav-stats' },
          h('div', {}, h('b', {}, fmt(c.wins)), h('small', {}, 'wins')),
          h('div', {}, h('b', {}, fmt(c.podiums)), h('small', {}, 'podiums')),
          h('div', {}, h('b', {}, fmt(c.entries)), h('small', {}, 'entries')),
          h('div', {}, h('b', {}, `${c.bestPercent}%`), h('small', {}, 'best score')),
        ),
        h('p', { class: 'tiny pav-intro' }, 'Dress for the theme, walk the runway and impress our three judges. Enter as often as you like!'),
      );
      addTwinkles(hero, 8);
      body.append(h('div', { class: 'pad' }, hero), h('div', { class: 'section-title pad-x', html: `${icon('crown')}Open contests` }));

      const list = h('div', { class: 'contest-list' });
      for (const b of c.board) {
        const theme = THEME_BY_ID[b.theme];
        const tier = BALANCE.contests.tiers[b.tier];
        const isSpot = b.theme === spot;
        list.append(h('button', { class: `contest-card tier-${b.tier} ${isSpot ? 'spot' : ''}`, onClick: () => { ctx.sfx.play('tap'); ctx.go('contest', { uid: b.uid }); } },
          h('div', { class: 'cc-icon' }, theme.icon),
          h('div', { class: 'cc-info' },
            h('div', { class: 'cc-row' }, h('b', {}, theme.name), h('span', { class: `tier-pill t-${b.tier}` }, tier.name)),
            isSpot ? h('div', { class: 'spot-tag' }, `✨ Theme of the day · +${Math.round(BALANCE.contests.spotlightBonus * 100)}% coins`) : null,
            palette(theme),
            h('div', { class: 'cc-row small' }, h('span', { class: 'muted tiny' }, `${tier.rivals} rivals · win`), rewardChips(prizeFor(1, b.tier, isSpot))),
          )));
      }
      body.append(list);

      const next = Object.entries(BALANCE.contests.tiers).find(([id]) => !tierAvailable(s, id));
      if (next) body.append(h('p', { class: 'muted tiny pad-x center' }, `🔒 ${next[1].name} contests (bigger prizes, tougher rivals) unlock at level ${next[1].minLevel}.`));

      body.append(h('div', { class: 'pad' }, h('button', { class: 'judge-card', onClick: () => guestJudge(ctx) },
        h('span', { class: 'jc-ico' }, '⚖️'),
        h('div', {}, h('b', {}, 'Be a guest judge'), h('small', { class: 'muted' }, `Pick the stronger look — ${BALANCE.contests.guestJudge.coins} coins per correct call (up to ${BALANCE.contests.guestJudge.paidRoundsPerDay} a day)`)),
      )));

      if (c.history.length) {
        body.append(h('div', { class: 'section-title pad-x', html: `${icon('star')}Recent results` }));
        body.append(h('div', { class: 'history pad' }, c.history.slice(0, 8).map((r) => h('div', { class: 'hist' },
          h('span', { class: 'hist-place' }, MEDAL[r.place] || `#${r.place}`),
          h('span', { class: 'hist-name' }, `${THEME_BY_ID[r.theme]?.name} · ${BALANCE.contests.tiers[r.tier]?.name}`),
          h('b', {}, `${r.percent}%`)))));
      }
    }
    render();
    const unsub = ctx.store.subscribe((s) => s && render());
    return unsub;
  },
};

// ================================================================== guest judge
async function guestJudge(ctx) {
  ctx.store.transact((d) => { ensureJudgeRound(d); }, 'judge-round');
  const s = ctx.store.get();
  const round = s.contests.judge.round;
  const theme = THEME_BY_ID[round.theme];
  const left = BALANCE.contests.guestJudge.paidRoundsPerDay - s.contests.judge.paid;
  const pickBody = h('div', { class: 'gj' },
    h('p', {}, 'Theme: ', h('b', {}, `${theme.icon} ${theme.name}`)),
    wanted(theme),
    h('div', { class: 'gj-row' }, round.looks.map((l, i) => h('button', { class: 'gj-look', dataset: { i } },
      h('div', { class: 'gj-av', html: renderAvatar(l.appearance, l.equipped, { viewBox: '10 0 180 440', shadow: false }) }), h('small', {}, l.name)))),
    h('p', { class: 'muted tiny' }, left > 0 ? `${left} paid rounds left today` : 'Paid rounds used up today — judging is still just for fun!'),
  );
  const choice = await new Promise((resolve) => {
    ctx.modal.open({ title: 'Guest judge', body: pickBody, buttons: [], className: 'wide' }).then(() => resolve(null));
    pickBody.querySelectorAll('.gj-look').forEach((b) => b.addEventListener('click', () => { resolve(Number(b.dataset.i)); b.closest('.modal-card').closeModal(true); }));
  });
  if (choice === null) return;
  const r = ctx.store.transact((d) => answerJudgeRound(d, choice), 'judge-answer');
  ctx.sfx.play(r.correct ? 'reward' : 'error');
  const again = await ctx.modal.open({
    title: r.correct ? 'Great eye!' : 'Not quite!',
    body: h('div', {},
      h('p', {}, r.correct ? 'The panel agrees with you!' : 'The judges preferred the other look.'),
      h('p', { class: 'muted tiny' }, `Panel scores: ${round.looks[0].name} ${r.totals[0]} · ${round.looks[1].name} ${r.totals[1]} (out of 30)`),
      r.reward ? rewardChips(r.reward) : null),
    buttons: [{ label: 'Done', value: false }, { label: 'Judge again', value: true, cls: 'btn-primary' }],
  });
  if (r.levels?.length) await celebrate(ctx, { levels: r.levels });
  if (again) guestJudge(ctx);
}

// ================================================================== contest flow
export const contest = {
  id: 'contest',
  chrome: 'full',
  title: 'Fashion contest',
  mount(el, params, ctx) {
    const entry = ctx.store.get().contests.board.find((b) => b.uid === params.uid);
    if (!entry) { el.append(h('div', { class: 'empty' }, 'This contest has finished.', h('br'), h('button', { class: 'btn btn-primary', onClick: () => ctx.go('pavilion') }, 'Back to the Pavilion'))); return; }
    const theme = THEME_BY_ID[entry.theme];
    const tier = BALANCE.contests.tiers[entry.tier];
    const isSpot = entry.theme === spotlightTheme();
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const cleanup = () => { timers.forEach(clearTimeout); timers = []; };

    if (!tierAvailable(ctx.store.get(), entry.tier)) { el.append(h('div', { class: 'empty' }, `Reach level ${tier.minLevel} to enter ${tier.name} contests.`)); return cleanup; }
    dressPhase();
    return cleanup;

    // ---------------------------------------------------------------- 1. dressing room
    function dressPhase() {
      let filter = 'match';
      el.innerHTML = '';
      const stage = h('div', { class: 'avatar-stage' });
      const avatarBox = h('div', { class: 'avatar-idle stage-fill' });
      stage.append(avatarBox);
      addTwinkles(stage, 5);
      const checklist = h('div', { class: 'checklist' });
      const chips = h('div', { class: 'chips' });
      const grid = h('div', { class: 'grid' });
      el.append(
        h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('pavilion'), html: `${icon('back')}Lobby` }), h('span', { class: `tier-pill t-${entry.tier}` }, tier.name)),
        h('div', { class: 'theme-card pad-x' },
          h('div', { class: 'tc-head' }, h('span', { class: 'tc-icon' }, theme.icon), h('div', {}, h('h3', {}, theme.name), h('p', { class: 'muted tiny' }, theme.blurb))),
          h('div', { class: 'tc-row' }, h('small', { class: 'muted' }, 'Judges love'), wanted(theme)),
          h('div', { class: 'tc-row' }, h('small', { class: 'muted' }, 'Palette'), palette(theme)),
          h('div', { class: 'tc-row' }, h('small', { class: 'muted' }, `Win${isSpot ? ' (theme of the day!)' : ''}`), rewardChips(prizeFor(1, entry.tier, isSpot))),
        ),
        h('div', { class: 'stage-wrap' }, stage, h('div', { class: 'side-panel' }, checklist)),
        chips, grid,
        h('div', { class: 'runway-footer' }, h('button', { class: 'btn btn-primary btn-block walk-btn', onClick: walk }, 'Walk the runway ✨')),
      );

      function renderAll() {
        const s = ctx.store.get();
        avatarBox.innerHTML = renderAvatar(s.appearance, s.equipped);
        renderChecklist(s);
        renderChips();
        renderGrid(s);
      }

      function renderChecklist(s) {
        const eq = wornItems(s.equipped);
        const acc = ['bag', 'earrings', 'necklace', 'bracelet', 'hairAcc'].filter((k) => eq[k]).length;
        const onTheme = Object.values(eq).filter((it) => tagFit(it.styles, theme) > 0).length;
        const sig = ['eyeshadow', 'eyeliner', 'lipstick', 'blush'].some((k) => theme.makeup?.includes(s.appearance[k]));
        const hair = HAIRSTYLES.find((x) => x.id === s.appearance.hairStyle);
        const rows = [
          [!!(eq.dress || (eq.top && eq.bottom)), theme.preferDress ? 'Full look (a gown or dress is best)' : 'Full look (dress, or top + bottom)'],
          [!!eq.shoes, 'Shoes'],
          [onTheme >= 3, `On-theme pieces: ${onTheme}`],
          [acc >= 2, `Accessories: ${acc}/5`],
          [tagFit(hair?.styles, theme) > 0, 'Hairstyle suits the theme'],
          [sig, 'Signature makeup for this theme'],
        ];
        checklist.innerHTML = '';
        checklist.append(h('b', { class: 'cl-title' }, 'Judges\' checklist'), ...rows.map(([ok, text]) => h('div', { class: `cl ${ok ? 'ok' : ''}` }, h('span', {}, ok ? '✓' : '○'), text)));
      }

      function renderChips() {
        const s = ctx.store.get();
        const owned = Object.keys(s.inventory.clothing).map((id) => CLOTHING_BY_ID[id]).filter(Boolean);
        const present = new Set(owned.map((i) => i.category));
        chips.innerHTML = '';
        const chip = (id, label) => h('button', { class: `chip ${filter === id ? 'active' : ''}`, onClick: () => { filter = id; ctx.sfx.play('tap'); renderChips(); renderGrid(ctx.store.get()); } }, label);
        chips.append(chip('match', '♥ Theme matches'), chip('beauty', '💄 Hair & makeup'), chip('all', 'All'));
        for (const c of CLOTHING_CATEGORIES) if (present.has(c.id)) chips.append(chip(c.id, c.name));
      }

      function renderGrid(s) {
        grid.innerHTML = '';
        grid.className = filter === 'beauty' ? 'beauty' : 'grid';
        if (filter === 'beauty') return renderBeauty(s);
        let items = Object.keys(s.inventory.clothing).map((id) => CLOTHING_BY_ID[id]).filter(Boolean);
        if (filter === 'match') items = items.filter((it) => tagFit(it.styles, theme) > 0);
        else if (filter !== 'all') items = items.filter((it) => it.category === filter);
        items.sort((a, b) => tagFit(b.styles, theme) - tagFit(a.styles, theme));
        if (!items.length) grid.append(h('div', { class: 'empty' }, 'None of your pieces fit this theme yet — Boutique Avenue can help!', h('br'), h('button', { class: 'btn btn-gold btn-small', onClick: () => ctx.go('mall') }, 'Go shopping')));
        for (const it of items) {
          const fit = tagFit(it.styles, theme);
          grid.append(itemCard({
            thumbHTML: renderItemThumb(it), name: it.name, rarity: it.rarity, equipped: isEquipped(s, it.id),
            footer: fit > 0 ? h('div', { class: 'meta fit' }, '♥'.repeat(fit >= 0.7 ? 3 : fit >= 0.4 ? 2 : 1)) : null,
            onClick: () => { ctx.store.transact((d) => toggleEquip(d, it.id), 'equip'); ctx.sfx.play('equip'); renderAll(); },
          }));
        }
      }

      function renderBeauty(s) {
        const section = (title, list, key, kind, swatch) => {
          const row = h('div', { class: 'beauty-row' });
          for (const e of list) {
            if (!owns(s, kind, e.id)) continue;
            const fit = tagFit(e.styles, theme) > 0 || theme.makeup?.includes(e.id) || theme.hairColors?.includes(e.id);
            row.append(h('button', {
              class: `bopt ${s.appearance[key] === e.id ? 'selected' : ''}`,
              onClick: () => { ctx.store.transact((d) => setAppearance(d, { [key]: e.id }), 'beauty'); ctx.sfx.play('equip'); renderAll(); },
            }, swatch(e), h('span', {}, e.name), fit ? h('i', {}, '♥') : null));
          }
          grid.append(h('div', { class: 'opt-group-title' }, title), row);
        };
        const dot = (c) => h('span', { class: 'bdot', style: { background: c || 'repeating-linear-gradient(45deg,#fff 0 3px,#f3dbe8 3px 6px)' } });
        section('Hairstyle', HAIRSTYLES, 'hairStyle', 'hairstyle', (e) => h('span', { class: 'bdot hair', html: renderAvatar({ ...s.appearance, hairStyle: e.id }, {}, { viewBox: '40 4 120 120', shadow: false, align: 'xMidYMid' }) }));
        section('Hair colour', HAIR_COLORS, 'hairColor', 'hairColor', (e) => dot(e.color));
        for (const k of ['eyeshadow', 'eyeliner', 'lipstick', 'blush']) {
          section(k[0].toUpperCase() + k.slice(1), MAKEUP.filter((m) => m.kind === k), k, 'makeup', (e) => dot(e.color || (e.style && e.style !== 'none' ? '#2a1420' : null)));
        }
        grid.append(h('p', { class: 'muted tiny center' }, 'More styles at Silk & Curl Salon and Blush Studio.'));
      }

      async function walk() {
        const s = ctx.store.get();
        const gate = canEnter(s);
        if (!gate.ok) { ctx.sfx.play('error'); ctx.toast(gate.message, { type: 'error' }); return; }
        const r = ctx.store.transact((d) => submitEntry(d, entry.uid), 'contest');
        if (r.ok === false) { ctx.toast(r.message || 'This contest is no longer open.', { type: 'error' }); ctx.go('pavilion'); return; }
        await ctx.saveNow();
        showPhase(r);
      }
      renderAll();
    }

    // ---------------------------------------------------------------- 2. runway show
    function showPhase(result) {
      el.innerHTML = '';
      el.scrollTop = 0;
      const runway = h('div', { class: 'runway', html: runwaySVG(theme) });
      const walker = h('div', { class: 'walker' });
      const caption = h('div', { class: 'walker-name' });
      const skip = h('button', { class: 'btn btn-soft btn-small skip-btn', onClick: () => { cleanup(); judgesPhase(result); } }, 'Skip ▸');
      runway.append(walker, caption, skip);
      el.append(runway);
      ctx.sfx.play('page');
      const order = [...result.contestants].sort((a, b) => (a.isPlayer ? 1 : 0) - (b.isPlayer ? 1 : 0)); // the player walks last
      const reduce = document.documentElement.classList.contains('reduce-motion');
      const step = reduce ? 600 : 1500;
      order.forEach((ct, i) => {
        later(() => {
          walker.innerHTML = renderAvatar(ct.look.appearance, ct.look.equipped, { shadow: true });
          walker.className = `walker walk ${ct.isPlayer ? 'me' : ''}`;
          caption.textContent = ct.isPlayer ? `✨ ${ct.name} (you!) ✨` : ct.name;
          caption.className = `walker-name show ${ct.isPlayer ? 'me' : ''}`;
          ctx.sfx.play(ct.isPlayer ? 'reward' : 'tap');
          if (ct.isPlayer) later(() => ctx.sparkleBurst(walker, 18), step * 0.6);
        }, i * step);
      });
      later(() => judgesPhase(result), order.length * step + 400);
    }

    // ---------------------------------------------------------------- 3. judges
    function judgesPhase(result) {
      el.innerHTML = '';
      el.scrollTop = 0;
      const me = result.me;
      const cards = h('div', { class: 'judge-panel' });
      me.judges.forEach((js, i) => {
        const j = JUDGE_BY_ID[js.judge];
        const card = h('div', { class: 'jcard' },
          h('div', { class: 'jc-av', html: renderAvatar(j.look.appearance, j.look.equipped, { viewBox: '46 8 108 120', shadow: false, align: 'xMidYMid', label: j.name }) }),
          h('div', { class: 'jc-body' }, h('b', {}, j.name), h('small', { class: 'muted' }, j.role), h('p', { class: 'jc-comment' }, `“${js.comment}”`)),
          h('div', { class: 'scorecard' }, h('span', {}, js.score.toFixed(1))));
        card.style.animationDelay = `${i * 0.5}s`;
        cards.append(card);
      });
      const bars = h('div', { class: 'cat-bars' }, Object.entries(CATEGORIES).map(([k, label]) => h('div', { class: 'cat-bar' },
        h('span', {}, label), h('div', { class: 'bar' }, h('i', { style: { width: `${me.scored.categories[k] * 10}%` } })), h('b', {}, me.scored.categories[k].toFixed(1)))));
      el.append(
        h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'The'), ' Judges')),
        h('div', { class: 'pad' }, h('div', { class: 'total-score' }, h('small', {}, 'Your score'), h('b', {}, `${me.total.toFixed(1)}`), h('span', {}, ' / 30'), h('em', {}, `${result.percent}%`))),
        h('div', { class: 'pad' }, cards),
        h('div', { class: 'pad' }, h('div', { class: 'panel' }, h('div', { class: 'section-title', html: `${icon('star')}Score breakdown` }), bars)),
        h('div', { class: 'pad' }, h('button', { class: 'btn btn-gold btn-block', onClick: () => resultsPhase(result) }, 'See the results 🏆')),
      );
      ctx.sfx.play('reward');
    }

    // ---------------------------------------------------------------- 4. results
    function resultsPhase(result) {
      el.innerHTML = '';
      el.scrollTop = 0;
      const top = result.ranked.slice(0, 3);
      const podiumOrder = [top[1], top[0], top[2]].filter(Boolean);
      const podium = h('div', { class: 'podium' }, podiumOrder.map((ct) => h('div', { class: `pod p${ct.place} ${ct.isPlayer ? 'me' : ''}` },
        h('div', { class: 'pod-av', html: renderAvatar(ct.look.appearance, ct.look.equipped, { viewBox: '10 0 180 440', shadow: false }) }),
        h('div', { class: 'pod-block' }, h('span', {}, MEDAL[ct.place]), h('small', {}, ct.isPlayer ? 'You!' : ct.name.split(' ')[0])))));
      addTwinkles(podium, 10);
      const me = result.me;
      const headline = me.place === 1 ? 'You won! 👑' : me.place <= 3 ? `${PLACE[me.place]} place — on the podium!` : `${PLACE[me.place]} place`;
      el.append(
        h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'Results'))),
        h('div', { class: 'pad' }, h('div', { class: `result-banner place-${me.place}` }, h('b', {}, headline), h('small', {}, `${theme.icon} ${theme.name} · ${tier.name}${result.spotlight ? ' · theme of the day' : ''}`), rewardChips(result.reward))),
        h('div', { class: 'pad' }, podium),
        h('div', { class: 'pad' }, h('div', { class: 'ranking' }, result.ranked.map((ct) => h('div', { class: `rank ${ct.isPlayer ? 'me' : ''}` },
          h('span', { class: 'rk' }, MEDAL[ct.place] || `#${ct.place}`),
          h('span', { class: 'rk-av', html: renderAvatar(ct.look.appearance, {}, { viewBox: '62 30 76 76', shadow: false, align: 'xMidYMid' }) }),
          h('span', { class: 'rk-name' }, ct.isPlayer ? `${ct.name} (you)` : ct.name),
          h('b', {}, ct.total.toFixed(1)))))),
        me.place <= 3 ? h('p', { class: 'muted tiny center' }, 'A trophy has been added to your apartment shelf!') : h('p', { class: 'muted tiny center' }, 'Tip: check the judges\' checklist and pick pieces marked ♥♥♥.'),
        h('div', { class: 'pad btn-row' },
          h('button', { class: 'btn btn-soft', onClick: () => ctx.go('pavilion') }, 'Lobby'),
          h('button', { class: 'btn btn-primary', onClick: () => { const b = ctx.store.get().contests.board[0]; ctx.go('contest', { uid: b.uid }, { replace: true }); } }, 'Next contest')),
      );
      if (me.place === 1) ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 3 }, 30);
      celebrate(ctx, { reward: result.reward, levels: result.levels }, { title: me.place === 1 ? `Champion of ${theme.name}!` : `+${fmt(result.reward.coins)} coins for taking part` });
    }
  },
};
