/**
 * GLITTER ARCADE — three replayable minigames, no cooldowns.
 *   arcade  : lobby with the three cabinets and best scores
 *   memory  : Fashion Memory (pairs of accessories, 3 difficulties)
 *   match3  : Jewellery Match-3 (tap or swipe to swap, cascades, 20 moves)
 *   styling : Timed Styling Challenge (dress a model from a studio kit in 45 s)
 * Every finished game is paid through claimMinigame (one ledger entry per play).
 */
import { h, appendTo, fmt, uid } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar, renderItemThumb } from '../components/avatarRenderer.js';
import { itemCard } from '../components/itemCard.js';
import { addTwinkles } from '../components/sparkles.js';
import { celebrate, rewardChips } from '../components/rewards.js';
import { createMemory, flipCard, hideMiss, memoryScore, memoryStars, MEMORY_LEVELS } from '../minigames/memory.js';
import { createMatch3, trySwap, match3Stars, JEWELS, MATCH3 } from '../minigames/match3.js';
import { createChallenge, scoreChallenge, KIT_SLOTS } from '../minigames/styling.js';
import { claimMinigame, minigameReward } from '../systems/minigameSystem.js';
import { CLOTHING_BY_ID } from '../data/clothing.js';
import { HAIRSTYLE } from '../data/appearance.js';
import { THEME_BY_ID } from '../data/competitions.js';
import { tagFit } from '../systems/competitionSystem.js';

const GAMES = [
  { id: 'memory', name: 'Fashion Memory', icon: '🃏', text: 'Flip cards and match pairs of accessories. Fewer moves, more stars.', color: '#ff7eb6' },
  { id: 'match3', name: 'Jewellery Match-3', icon: '💎', text: `Swap gems to line up 3 or more. Reach ${fmt(MATCH3.target)} points in ${MATCH3.moves} moves.`, color: '#9a6ee8' },
  { id: 'styling', name: 'Styling Challenge', icon: '⏱️', text: 'A surprise theme and a studio rail. Style the model before the clock runs out!', color: '#3fbf9a' },
];

const header = (ctx, title, backTo = 'arcade', backLabel = 'Arcade') =>
  h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back(backTo), html: `${icon('back')}${backLabel}` }), h('h2', {}, title));

const starsHTML = (n) => [1, 2, 3].map((i) => `<span class="mstar ${i <= n ? 'on' : ''}">★</span>`).join('');

/** Pay out, then show the results card. Resolves to 'again' | 'arcade'. */
async function finishGame(ctx, result, { title, lines = [] }) {
  const r = ctx.store.transact((d) => claimMinigame(d, result), 'minigame');
  if (r.ok === false) { ctx.toast('That game was already paid.', { type: 'info' }); return 'arcade'; }
  await ctx.saveNow();
  ctx.sfx.play(result.finished ? 'reward' : 'tap');
  const choice = await ctx.modal.open({
    title,
    className: 'celebrate mg-result',
    dismissable: false,
    body: h('div', { class: 'mg-res' },
      h('div', { class: 'mg-stars', html: starsHTML(result.stars) }),
      h('div', { class: 'mg-score' }, h('b', {}, fmt(result.score)), h('small', {}, result.game === 'styling' ? '% style score' : ' points')),
      r.best ? h('div', { class: 'mg-best' }, '🏆 New personal best!') : null,
      lines.map((l) => h('p', { class: 'muted tiny' }, l)),
      rewardChips(r.reward),
    ),
    buttons: [{ label: 'Arcade', value: 'arcade', cls: 'btn-soft' }, { label: 'Play again', value: 'again', cls: 'btn-primary' }],
  });
  await celebrate(ctx, { ...r, reward: {} }, {});
  if (r.reward.coins) ctx.floatText(document.querySelector('.pill-coin') || document.body, `+${fmt(r.reward.coins)}`);
  return choice || 'arcade';
}

// ================================================================== lobby
export const arcade = {
  id: 'arcade',
  chrome: 'full',
  title: 'Glitter Arcade',
  mount(el, params, ctx) {
    const s = ctx.store.get();
    const m = s.minigames || { played: 0, wins: 0, best: {} };
    const best = (g) => g === 'memory'
      ? Object.keys(MEMORY_LEVELS).map((l) => m.best[`memory_${l}`]).filter(Boolean).reduce((a, b) => Math.max(a, b), 0)
      : m.best[g] || 0;
    const hero = h('div', { class: 'arc-hero' },
      h('div', { class: 'arc-sign' }, h('span', { class: 'script' }, 'Glitter'), ' Arcade'),
      h('p', {}, 'Every game pays — play as often as you like!'),
      h('div', { class: 'arc-stats' },
        h('div', {}, h('b', {}, fmt(m.played)), h('small', {}, 'games played')),
        h('div', {}, h('b', {}, fmt(m.wins)), h('small', {}, 'finished')),
        h('div', { html: `<b>${fmt(minigameReward({ game: 'match3', finished: true, stars: 1 }).coins)}+</b><small>coins a game</small>` })));
    addTwinkles(hero, 7, ['#fff', '#7ce0ff', '#ffc4e0', '#ffe08a']);
    const cards = GAMES.map((g) => h('button', { class: 'arc-card', style: { '--c': g.color }, dataset: { game: g.id }, onClick: () => { ctx.sfx.play('tap'); g.id === 'memory' ? pickLevel() : ctx.go(g.id); } },
      h('div', { class: 'arc-ico' }, g.icon),
      h('div', { class: 'arc-info' }, h('b', {}, g.name), h('span', { class: 'muted tiny' }, g.text),
        h('span', { class: 'arc-best' }, best(g.id) ? `Best: ${fmt(best(g.id))}${g.id === 'styling' ? '%' : ''}` : 'Not played yet')),
      h('span', { class: 'arc-play' }, 'Play')));

    async function pickLevel() {
      const level = await ctx.modal.open({
        title: 'Fashion Memory',
        body: h('div', { class: 'mg-levels' }, h('p', { class: 'muted' }, 'Harder boards pay more.'),
          Object.entries(MEMORY_LEVELS).map(([id, L]) => h('div', { class: 'mg-level' }, h('b', {}, L.name), h('span', { class: 'muted tiny' }, `${L.pairs} pairs · ${minigameReward({ game: 'memory', level: id, finished: true, stars: 0 }).coins}+ coins`)))),
        buttons: Object.entries(MEMORY_LEVELS).map(([id, L]) => ({ label: L.name, value: id, cls: id === 'hard' ? 'btn-lilac' : id === 'medium' ? 'btn-gold' : 'btn-primary' })),
      });
      if (level) ctx.go('memory', { level });
    }

    el.append(header(ctx, '🎮 Glitter Arcade', 'city', 'City'), hero, h('div', { class: 'arc-list' }, cards));
  },
};

// ================================================================== Fashion Memory
export const memory = {
  id: 'memory',
  chrome: 'hud',
  title: 'Fashion Memory',
  mount(el, params, ctx) {
    const level = MEMORY_LEVELS[params.level] ? params.level : 'easy';
    let g; let started; let timer; let over;
    const stats = h('div', { class: 'mg-bar' });
    const board = h('div', { class: 'mem-board' });
    el.append(header(ctx, `🃏 Memory · ${MEMORY_LEVELS[level].name}`), stats, board);

    function start() {
      g = createMemory(level, `${Date.now()}-${Math.random()}`);
      started = Date.now(); over = false;
      board.style.setProperty('--cols', g.cols);
      board.innerHTML = '';
      g.cards.forEach((c, i) => {
        const it = CLOTHING_BY_ID[c.face];
        board.append(h('button', { class: 'mem-card', dataset: { i }, 'aria-label': 'Hidden card', onClick: () => tap(i) },
          h('div', { class: 'mem-inner' }, h('div', { class: 'mem-back' }, '✦'), h('div', { class: 'mem-front', html: renderItemThumb(it) }))));
      });
      clearInterval(timer);
      timer = setInterval(renderStats, 500);
      renderStats();
    }
    const secs = () => Math.round((Date.now() - started) / 1000);
    function renderStats() {
      stats.innerHTML = '';
      stats.append(h('span', {}, `Pairs ${g.matches}/${g.pairs}`), h('span', {}, `Moves ${g.moves}`), h('span', {}, `⏱ ${secs()}s`));
    }
    function paint() {
      g.cards.forEach((c, i) => {
        const b = board.children[i];
        b.classList.toggle('open', c.open || c.matched);
        b.classList.toggle('matched', c.matched);
        b.setAttribute('aria-label', c.open || c.matched ? CLOTHING_BY_ID[c.face].name : 'Hidden card');
      });
    }
    function tap(i) {
      if (over) return;
      const r = flipCard(g, i);
      if (r.result === 'ignored') return;
      ctx.sfx.play(r.result === 'match' ? 'equip' : 'tap');
      paint(); renderStats();
      if (r.result === 'match') ctx.sparkleBurst(board.children[i], 8);
      if (r.result === 'miss') setTimeout(() => { hideMiss(g); paint(); }, 750);
      if (r.done) end();
    }
    async function end() {
      over = true; clearInterval(timer);
      const seconds = secs();
      const stars = memoryStars(g);
      const choice = await finishGame(ctx, { game: 'memory', uid: uid('mem'), level, score: memoryScore(g, seconds), stars, finished: true },
        { title: 'All pairs found!', lines: [`${g.moves} moves · ${seconds} seconds`] });
      if (choice === 'again') start(); else ctx.go('arcade', {}, { replace: true });
    }
    start();
    return () => clearInterval(timer);
  },
};

// ================================================================== Jewellery Match-3
function gemSVG(j) {
  const c = JEWELS[j]?.color || '#ccc';
  const shapes = [
    '<path d="M20 4 L34 16 L20 36 L6 16 Z"/>', // ruby: diamond
    '<circle cx="20" cy="20" r="15"/>', // sapphire: round
    '<path d="M11 5 H29 L36 14 V26 L29 35 H11 L4 26 V14 Z"/>', // emerald: octagon
    '<path d="M20 4 L35 20 L20 36 L5 20 Z" transform="rotate(45 20 20) scale(.9) translate(2 2)"/>', // topaz
    '<path d="M20 3 L36 14 L30 35 H10 L4 14 Z"/>', // amethyst: pentagon
    '<path d="M20 34 C 4 22 5 8 13 7 C 17 6 19 9 20 11 C 21 9 23 6 27 7 C 35 8 36 22 20 34 Z"/>', // pearl heart
  ];
  return `<svg viewBox="0 0 40 40" class="gem-svg"><g fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width="1.2">${shapes[j] || shapes[1]}</g>
    <ellipse cx="15" cy="13" rx="5" ry="3" fill="#fff" opacity=".55" transform="rotate(-25 15 13)"/></svg>`;
}

export const match3 = {
  id: 'match3',
  chrome: 'hud',
  title: 'Jewellery Match-3',
  mount(el, params, ctx) {
    let g; let sel = null; let busy = false; let drag = null;
    const bar = h('div', { class: 'mg-bar' });
    const prog = h('div', { class: 'm3-prog' }, h('i'));
    const grid = h('div', { class: 'm3-board', role: 'grid' });
    const tip = h('p', { class: 'muted tiny center' }, 'Tap a gem, then a neighbour — or swipe. Lines of 4 and 5 score bonus points; cascades multiply!');
    el.append(header(ctx, '💎 Jewellery Match-3'), bar, prog, grid, tip);

    function start() {
      g = createMatch3(`${Date.now()}-${Math.random()}`);
      sel = null; busy = false;
      grid.style.setProperty('--n', g.size);
      draw(g.board);
      renderBar();
    }
    function renderBar() {
      bar.innerHTML = '';
      bar.append(h('span', {}, `Score ${fmt(g.score)}`), h('span', {}, `Target ${fmt(g.target)}`), h('span', { class: g.moves <= 3 ? 'warn' : '' }, `Moves ${g.moves}`));
      prog.firstChild.style.width = `${Math.min(100, (g.score / g.target) * 100)}%`;
    }
    function draw(board, cleared = []) {
      const gone = new Set(cleared.map(([r, c]) => r * 100 + c));
      grid.innerHTML = '';
      board.forEach((row, r) => row.forEach((j, c) => {
        grid.append(h('button', {
          class: `gem ${sel && sel.r === r && sel.c === c ? 'sel' : ''} ${gone.has(r * 100 + c) ? 'pop' : ''}`,
          dataset: { r, c }, 'aria-label': `${JEWELS[j]?.name} row ${r + 1} column ${c + 1}`, html: gemSVG(j),
        }));
      }));
    }
    const cellOf = (e) => { const b = e.target.closest('.gem'); return b ? { r: +b.dataset.r, c: +b.dataset.c } : null; };
    grid.addEventListener('pointerdown', (e) => {
      const cell = cellOf(e);
      if (!cell || busy) return;
      drag = { cell, x: e.clientX, y: e.clientY, moved: false };
    });
    grid.addEventListener('pointermove', (e) => {
      if (!drag || drag.moved || busy) return;
      const dx = e.clientX - drag.x; const dy = e.clientY - drag.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      drag.moved = true;
      const to = Math.abs(dx) > Math.abs(dy) ? { r: drag.cell.r, c: drag.cell.c + Math.sign(dx) } : { r: drag.cell.r + Math.sign(dy), c: drag.cell.c };
      sel = null;
      if (to.r >= 0 && to.c >= 0 && to.r < g.size && to.c < g.size) swap(drag.cell, to);
    });
    grid.addEventListener('pointerup', (e) => {
      const d = drag; drag = null;
      if (!d || d.moved || busy) return;
      const cell = d.cell;
      if (!sel) { sel = cell; ctx.sfx.play('tap'); draw(g.board); return; }
      if (sel.r === cell.r && sel.c === cell.c) { sel = null; draw(g.board); return; }
      const from = sel; sel = null;
      if (Math.abs(from.r - cell.r) + Math.abs(from.c - cell.c) !== 1) { sel = cell; draw(g.board); return; }
      swap(from, cell);
    });
    grid.addEventListener('pointercancel', () => { drag = null; });

    const wait = (ms) => new Promise((res) => setTimeout(res, document.documentElement.classList.contains('reduce-motion') ? 0 : ms));
    async function swap(a, b) {
      if (busy || g.status !== 'playing') return;
      const before = g.board.map((r) => [...r]);
      const res = trySwap(g, a, b);
      if (!res.ok) {
        ctx.sfx.play('error');
        draw(before);
        const n = grid.children[a.r * g.size + a.c];
        n?.classList.add('shake');
        return;
      }
      busy = true;
      // show the swap, then each cascade step
      [before[a.r][a.c], before[b.r][b.c]] = [before[b.r][b.c], before[a.r][a.c]];
      let shown = before;
      for (const step of res.steps) {
        draw(shown, step.cleared);
        ctx.sfx.play(step.combo > 1 ? 'reward' : 'equip');
        if (step.combo > 1) ctx.floatText(grid, `Combo ×${step.combo}!`);
        await wait(260);
        shown = step.board;
        draw(shown);
        grid.classList.add('drop');
        await wait(180);
        grid.classList.remove('drop');
      }
      draw(g.board);
      if (res.reshuffled) ctx.toast('No moves left — the jewels were reshuffled ✨', { type: 'info' });
      renderBar();
      busy = false;
      if (g.status !== 'playing') end();
    }
    async function end() {
      const won = g.status === 'won';
      if (won) ctx.sparkleBurst(grid, 24);
      const choice = await finishGame(ctx, { game: 'match3', uid: uid('m3'), score: g.score, stars: match3Stars(g), finished: won },
        { title: won ? 'Dazzling! Target reached!' : 'Out of moves!', lines: [won ? `${g.moves} moves to spare · best cascade ×${g.combos}` : `You scored ${fmt(g.score)} of ${fmt(g.target)} — practice pays too!`] });
      if (choice === 'again') start(); else ctx.go('arcade', {}, { replace: true });
    }
    start();
  },
};

// ================================================================== Timed Styling Challenge
const SLOT_LABEL = { dress: 'Dress', top: 'Top', bottom: 'Bottom', shoes: 'Shoes', bag: 'Bag', earrings: 'Earrings', necklace: 'Necklace', hairAcc: 'Hair', hair: 'Hairstyle' };

export const styling = {
  id: 'styling',
  chrome: 'hud',
  title: 'Styling Challenge',
  mount(el, params, ctx) {
    let ch; let look; let tab; let endsAt; let timer; let over;
    const body = h('div', { class: 'sty-wrap' });
    el.append(header(ctx, '⏱️ Styling Challenge'), body);

    function intro() {
      clearInterval(timer);
      ch = createChallenge(`${Date.now()}-${Math.random()}`);
      const theme = THEME_BY_ID[ch.theme];
      body.innerHTML = '';
      body.append(h('div', { class: 'panel sty-intro' },
        h('div', { class: 'sty-theme-ico' }, theme.icon || '👗'),
        h('h3', {}, theme.name),
        h('p', { class: 'muted' }, theme.blurb || ''),
        h('div', { class: 'palette center-row' }, theme.palette.map((c) => h('span', { style: { background: c } }))),
        h('p', {}, `You have `, h('b', {}, `${ch.seconds} seconds`), ' to style the model from the studio rail. Pick on-theme pieces in matching colours — some are decoys!'),
        h('button', { class: 'btn btn-primary sty-go', onClick: play }, 'Start the clock!')));
    }

    function play() {
      const s = ctx.store.get();
      look = { appearance: { ...s.appearance, hairStyle: ch.hair[0] }, equipped: {} };
      tab = 'dress'; over = false;
      endsAt = Date.now() + ch.seconds * 1000;
      ctx.sfx.play('page');
      render();
      timer = setInterval(tick, 250);
    }
    function tick() {
      const left = Math.max(0, endsAt - Date.now());
      const t = body.querySelector('.sty-timer');
      if (t) { t.querySelector('b').textContent = Math.ceil(left / 1000); t.style.setProperty('--p', left / (ch.seconds * 1000)); t.classList.toggle('warn', left < 10000); }
      if (left <= 0) done(true);
    }
    function choose(slot, id) {
      if (over) return;
      if (slot === 'hair') look.appearance.hairStyle = id;
      else if (look.equipped[slot] === id) delete look.equipped[slot];
      else {
        look.equipped[slot] = id;
        if (slot === 'dress') { delete look.equipped.top; delete look.equipped.bottom; }
        if (slot === 'top' || slot === 'bottom') delete look.equipped.dress;
      }
      ctx.sfx.play('equip');
      render();
    }
    function render() {
      const theme = THEME_BY_ID[ch.theme];
      const eq = Object.fromEntries(Object.entries(look.equipped).map(([k, id]) => [k, CLOTHING_BY_ID[id]]));
      const left = Math.max(0, endsAt - Date.now());
      const items = tab === 'hair' ? ch.hair.map((id) => HAIRSTYLE[id]) : ch.kit[tab].map((id) => CLOTHING_BY_ID[id]);
      body.innerHTML = '';
      appendTo(body,
        h('div', { class: 'sty-top' },
          h('div', { class: 'sty-stage', html: renderAvatar(look.appearance, look.equipped) }),
          h('div', { class: 'sty-side' },
            h('div', { class: 'sty-timer', style: { '--p': left / (ch.seconds * 1000) } }, h('b', {}, Math.ceil(left / 1000)), h('small', {}, 'sec')),
            h('div', { class: 'sty-theme' }, h('b', {}, `${theme.icon || ''} ${theme.name}`), h('div', { class: 'palette' }, theme.palette.map((c) => h('span', { style: { background: c } })))),
            h('div', { class: 'sty-count muted tiny' }, `${Object.keys(eq).length} pieces styled`),
            h('button', { class: 'btn btn-gold btn-small sty-done', onClick: () => done(false) }, 'Done ✓'))),
        h('div', { class: 'chips sty-tabs' }, [...KIT_SLOTS, 'hair'].map((slot) => h('button', {
          class: `chip ${tab === slot ? 'active' : ''} ${slot === 'hair' || look.equipped[slot] ? 'filled' : ''}`, onClick: () => { tab = slot; render(); },
        }, SLOT_LABEL[slot]))),
        h('div', { class: 'grid sty-grid' }, items.map((it) => tab === 'hair'
          ? h('button', { class: `bopt ${look.appearance.hairStyle === it.id ? 'selected' : ''}`, onClick: () => choose('hair', it.id) },
            h('span', { class: 'bdot hair', html: renderAvatar({ ...look.appearance, hairStyle: it.id }, {}, { viewBox: '40 4 120 120', shadow: false, align: 'xMidYMid' }) }), h('span', {}, it.name))
          : itemCard({ thumbHTML: renderItemThumb(it), name: it.name, rarity: it.rarity, equipped: look.equipped[tab] === it.id, onClick: () => choose(tab, it.id) }))),
      );
    }
    async function done(timeUp) {
      if (over) return;
      over = true; clearInterval(timer);
      const res = scoreChallenge(look, ch.theme);
      const theme = THEME_BY_ID[ch.theme];
      const onTheme = Object.values(look.equipped).filter((id) => tagFit(CLOTHING_BY_ID[id].styles, theme) > 0).length;
      const choice = await finishGame(ctx, { game: 'styling', uid: uid('sty'), score: res.percent, stars: res.stars, finished: res.stars > 0 },
        { title: timeUp ? "Time's up!" : 'Look submitted!', lines: [`${theme.name}: ${onTheme} on-theme piece${onTheme === 1 ? '' : 's'}`, `Theme ${res.categories.theme.toFixed(1)} · Colour ${res.categories.colour.toFixed(1)} · Coordination ${res.categories.coordination.toFixed(1)}`] });
      if (choice === 'again') intro(); else ctx.go('arcade', {}, { replace: true });
    }
    intro();
    return () => clearInterval(timer);
  },
};
