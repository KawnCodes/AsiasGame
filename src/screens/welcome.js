/** WELCOME — title screen with Continue / New Game. */
import { h } from '../utils/dom.js';
import { renderAvatar } from '../components/avatarRenderer.js';
import { skylineSVG } from '../components/art/sceneArt.js';
import { addTwinkles } from '../components/sparkles.js';
import { deleteSave } from '../systems/saveSystem.js';

const MODEL_A = [{ skin: 'honey', hairStyle: 'hollywood', hairColor: 'honey_blonde', eyes: 'almond', lipstick: 'lip_red', eyeliner: 'el_wing', eyeshadow: 'es_champagne' }, { dress: 'gown_red_mermaid', earrings: 'ear_chandelier', bag: 'bag_gold_clutch' }];
const MODEL_B = [{ skin: 'cocoa', hairStyle: 'curls', hairColor: 'dark_brown', eyes: 'doe', eyeshadow: 'es_gold', lipstick: 'lip_berry' }, { top: 'top_corset_rose', bottom: 'bot_satin_midi', shoes: 'sh_gold_sandals', earrings: 'ear_gold_hoops', necklace: 'neck_heart_pendant' }];

export default {
  id: 'welcome',
  chrome: 'none',
  mount(el, params, ctx) {
    const s = ctx.store.get();
    const hasSave = !!s;
    const left = hasSave ? renderAvatar(s.appearance, s.equipped) : renderAvatar(...MODEL_A);
    const right = renderAvatar(...MODEL_B);

    const continueBtn = hasSave
      ? h('button', { class: 'btn btn-primary btn-block', onClick: () => { ctx.sfx.play('equip'); ctx.go('home'); } }, `Continue as ${s.player.name}`)
      : null;
    const newBtn = h('button', {
      class: `btn ${hasSave ? 'btn-soft' : 'btn-primary'} btn-block`,
      onClick: async () => {
        if (hasSave) {
          const ok = await ctx.modal.confirm('Start Over?', '<p>Starting a new game will <b>replace your current star</b> and all progress.</p><p class="muted tiny">Tip: export a backup from Settings first.</p>', 'Start fresh', 'Keep playing');
          if (!ok) return;
          await deleteSave();
          ctx.store.replace(null);
        }
        ctx.go('creator', { mode: 'new' });
      },
    }, hasSave ? 'New Game' : 'Begin Your Story');

    const view = h('div', { class: 'welcome' },
      h('div', { class: 'welcome-sky' }),
      h('div', { class: 'welcome-skyline', html: skylineSVG() }),
      h('div', { class: 'welcome-logo' },
        h('div', { class: 'logo-small' }, '✦ a fashion life story ✦'),
        h('h1', { class: 'logo-script' }, 'Glamour', h('span', {}, 'City')),
      ),
      h('div', { class: 'welcome-models' },
        h('div', { class: 'model model-left', html: left }),
        h('div', { class: 'model model-right', html: right }),
      ),
      h('div', { class: 'welcome-actions' },
        continueBtn,
        newBtn,
        h('div', { class: 'tiny muted version' }, 'v0.2 · Milestone 2 preview'),
      ),
    );
    addTwinkles(view, 16);
    el.append(view);
  },
};
