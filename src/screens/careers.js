/**
 * CAREERS — the Work hub (all three careers at a glance) and each career's studio
 * screen with its job board and live countdown.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar } from '../components/avatarRenderer.js';
import { ticker } from '../components/ticker.js';
import { celebrate, rewardChips } from '../components/rewards.js';
import { CAREERS, CAREER_BY_ID, JOBS, JOB_BY_ID } from '../data/careers.js';
import { BALANCE } from '../data/gameBalance.js';
import {
  startJob, claimJob, cancelJob, remainingMs, isReady, careerProgress, careerTitle, isCareerUnlocked, jobLockReason, previewReward, styleMatches,
} from '../systems/careerSystem.js';
import { formatDuration } from '../utils/time.js';

const TIER_LABEL = { beginner: 'Beginner', standard: 'Standard', higher: 'Pro', celebrity: 'Celebrity' };

/** Collect a finished job (shared by hub, studio and anywhere else). */
export async function collectJob(ctx, careerId, fromEl) {
  const r = ctx.store.transact((d) => claimJob(d, careerId), 'claim-job');
  if (r.ok === false) { ctx.sfx.play('error'); return r; }
  await ctx.saveNow();
  if (r.duplicate) { ctx.toast('That job was already paid.', { type: 'info' }); return r; }
  await celebrate(ctx, r, { title: `${r.job.name} complete!${r.reward.styleBonus ? ' Style bonus ✨' : ''}`, from: fromEl });
  return r;
}

function ring(ratio, size = 64) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#ffe0ee" stroke-width="7"/>
    <circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#ringGrad)" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - ratio)).toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <defs><linearGradient id="ringGrad"><stop offset="0" stop-color="#ff9ccb"/><stop offset="1" stop-color="#9a6ee8"/></linearGradient></defs>
  </svg>`;
}

function setRing(el, ratio) {
  const fg = el.querySelector('.ring-fg');
  if (!fg) return;
  const c = parseFloat(fg.getAttribute('stroke-dasharray'));
  fg.setAttribute('stroke-dashoffset', (c * (1 - ratio)).toFixed(1));
}

const ratioDone = (a, now) => Math.min(1, (now - a.startedAt) / (a.endsAt - a.startedAt));

// ------------------------------------------------------------------ Work hub
export const work = {
  id: 'work',
  chrome: 'full',
  title: 'Work',
  mount(el, params, ctx) {
    const list = h('div', { class: 'career-list' });
    el.append(
      h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'Star'), ' Careers')),
      h('div', { class: 'panel style-tip' }, h('b', {}, '✨ Style bonus'), h('span', { class: 'muted tiny' }, ` Wear ${BALANCE.jobs.styleMatchesNeeded}+ pieces matching a job's style for +${Math.round(BALANCE.jobs.styleBonus * 100)}% coins. Up to three jobs can run at once — one per career.`)),
      list,
    );

    function render() {
      const s = ctx.store.get();
      const now = Date.now();
      list.innerHTML = '';
      for (const c of CAREERS) {
        const unlocked = isCareerUnlocked(s, c.id);
        const cs = s.careers[c.id];
        const prog = careerProgress(s, c.id);
        const active = s.activeJobs[c.id];
        let status;
        if (!unlocked) status = h('div', { class: 'cstatus locked', html: `${icon('lock')} Unlocks at level ${c.unlockLevel}` });
        else if (active && isReady(active, now)) {
          status = h('div', { class: 'cstatus ready' }, h('span', {}, `✓ ${JOB_BY_ID[active.jobId].name} done!`),
            h('button', { class: 'btn btn-gold btn-small collect', onClick: (e) => { e.stopPropagation(); collectJob(ctx, c.id, e.currentTarget).then(render); } }, 'Collect'));
        } else if (active) {
          status = h('div', { class: 'cstatus working', dataset: { career: c.id } }, h('span', { class: 'cring', html: ring(ratioDone(active, now), 34) }),
            h('span', {}, `${JOB_BY_ID[active.jobId].name} · `, h('b', { class: 'ctime' }, formatDuration(remainingMs(active, now)))));
        } else status = h('div', { class: 'cstatus idle' }, 'Ready for a new job →');

        list.append(h('button', {
          class: `career-card ${unlocked ? '' : 'locked'}`, style: { '--c': c.color },
          onClick: () => { if (!unlocked) { ctx.sfx.play('error'); ctx.toast(`${c.name} unlocks at level ${c.unlockLevel}. Keep working!`, { iconName: 'lock' }); return; } ctx.sfx.play('tap'); ctx.go('career', { career: c.id }); },
        },
        h('div', { class: 'cc-mentor', html: renderAvatar(c.mentorLook.appearance, c.mentorLook.equipped, { viewBox: '46 10 108 120', shadow: false, align: 'xMidYMid' }) }),
        h('div', { class: 'cc-body' },
          h('div', { class: 'cc-top' }, h('b', {}, `${c.icon} ${c.name}`), h('span', { class: 'cc-lvl' }, `Lv ${cs.level}`)),
          h('small', { class: 'muted' }, unlocked ? `${careerTitle(c.id, cs.level)} · ${c.studio}` : c.studio),
          h('div', { class: 'xp-bar career' }, h('i', { style: { width: `${Math.round(prog.ratio * 100)}%` } })),
          status,
        )));
      }
    }
    render();
    const unsubTick = ticker.subscribe((now) => {
      const s = ctx.store.get();
      for (const c of CAREERS) {
        const a = s.activeJobs[c.id];
        const node = list.querySelector(`.cstatus.working[data-career="${c.id}"]`);
        if (!a || !node) continue;
        if (isReady(a, now)) { render(); return; }
        node.querySelector('.ctime').textContent = formatDuration(remainingMs(a, now));
        setRing(node, ratioDone(a, now));
      }
    });
    const unsub = ctx.store.subscribe((s) => s && render());
    return () => { unsubTick(); unsub(); };
  },
};

// ------------------------------------------------------------------ Career studio
export const career = {
  id: 'career',
  chrome: 'full',
  title: 'Career studio',
  mount(el, params, ctx) {
    const c = CAREER_BY_ID[params.career] || CAREERS[0];
    const head = h('div', { class: 'studio-head', style: { '--c': c.color } });
    const activeBox = h('div', { class: 'active-job' });
    const jobsBox = h('div', { class: 'job-list' });
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('work'), html: `${icon('back')}Work` }), h('h2', { class: 'studio-title' }, c.studio)),
      head, activeBox, h('div', { class: 'section-title pad-x', html: `${icon('star')}Job board` }), jobsBox,
    );

    function renderHead(s) {
      const cs = s.careers[c.id];
      const prog = careerProgress(s, c.id);
      head.innerHTML = '';
      appendTo(head, 
        h('div', { class: 'mentor', html: renderAvatar(c.mentorLook.appearance, c.mentorLook.equipped, { viewBox: '30 0 140 250', shadow: false }) }),
        h('div', { class: 'studio-info' },
          h('div', { class: 'career-name' }, `${c.icon} ${c.name}`),
          h('div', { class: 'career-rank' }, h('b', {}, `Level ${cs.level}`), ` · ${careerTitle(c.id, cs.level)}`),
          h('div', { class: 'xp-bar career big' }, h('i', { style: { width: `${Math.round(prog.ratio * 100)}%` } })),
          h('small', { class: 'muted tiny' }, prog.max ? 'Top of your field! ✨' : `${prog.current} / ${prog.need} career XP to ${careerTitle(c.id, cs.level + 1)}`),
          !prog.max ? h('small', { class: 'promo-hint' }, `Promotion: +${fmt(BALANCE.rewards.careerPromotion.coins)} coins & ${BALANCE.rewards.careerPromotion.gems} gems`) : null,
          h('small', { class: 'muted tiny' }, `${cs.jobsDone} jobs completed · mentor ${c.mentor}`),
        ),
      );
    }

    function renderActive(s) {
      const a = s.activeJobs[c.id];
      activeBox.innerHTML = '';
      activeBox.className = 'active-job';
      if (!a) {
        activeBox.append(h('div', { class: 'idle-note' }, 'Pick a job below to get to work. It keeps running even if you leave — or close the app!'));
        return;
      }
      const job = JOB_BY_ID[a.jobId];
      const now = Date.now();
      const ready = isReady(a, now);
      activeBox.classList.add('on', `fx-${c.id}`);
      appendTo(activeBox, 
        h('div', { class: 'aj-stage' }, h('div', { class: 'aj-avatar', html: renderAvatar(s.appearance, s.equipped, { viewBox: '20 0 160 440', shadow: false }) }), h('div', { class: 'aj-fx', 'aria-hidden': 'true' })),
        h('div', { class: 'aj-info' },
          h('small', { class: 'muted' }, ready ? 'Finished!' : 'Now working'),
          h('b', { class: 'aj-name' }, job.name),
          h('div', { class: 'aj-timer' }, h('span', { class: 'aj-ring', html: ring(ratioDone(a, now), 70) }), h('span', { class: 'aj-time' }, ready ? '✓' : formatDuration(remainingMs(a, now)))),
          rewardChips({ coins: a.reward.coins, xp: a.reward.xp, fame: a.reward.fame }),
          a.reward.styleBonus ? h('small', { class: 'bonus-tag' }, '✨ Style bonus included') : null,
          ready
            ? h('button', { class: 'btn btn-gold collect pulse', onClick: (e) => collectJob(ctx, c.id, e.currentTarget) }, 'Collect pay')
            : h('button', { class: 'link-btn', onClick: async () => { if (await ctx.modal.confirm('Cancel job?', '<p>You won\'t be paid for an unfinished job.</p>', 'Cancel job', 'Keep working')) ctx.store.transact((d) => cancelJob(d, c.id), 'cancel-job'); } }, 'Cancel job'),
        ),
      );
    }

    function renderJobs(s) {
      jobsBox.innerHTML = '';
      const busy = !!s.activeJobs[c.id];
      for (const job of JOBS.filter((j) => j.career === c.id)) {
        const lock = jobLockReason(s, job);
        const rw = previewReward(s, job);
        const matches = styleMatches(s, job);
        jobsBox.append(h('div', { class: `job-card tier-${job.tier} ${lock ? 'locked' : ''}` },
          h('div', { class: 'job-top' },
            h('div', {}, h('b', {}, job.name), h('div', { class: 'muted tiny' }, job.blurb)),
            h('span', { class: 'dur' }, `⏱ ${job.seconds}s`)),
          h('div', { class: 'job-mid' }, h('span', { class: `tier tier-${job.tier}` }, TIER_LABEL[job.tier]), rewardChips({ coins: rw.coins, xp: rw.xp, fame: rw.fame })),
          h('div', { class: 'job-bottom' },
            h('div', { class: 'tags' }, job.styles.map((t) => h('span', { class: 'tag' }, t)),
              h('span', { class: `match ${rw.styleBonus ? 'yes' : ''}` }, rw.styleBonus ? '✓ outfit matches' : `${matches}/${BALANCE.jobs.styleMatchesNeeded} matching`)),
            lock
              ? h('span', { class: 'lock-note', html: `${icon('lock')}${lock}` })
              : h('button', { class: 'btn btn-primary btn-small', disabled: busy, onClick: (e) => start(job, e.currentTarget) }, busy ? 'Busy' : 'Start'),
          )));
      }
    }

    function start(job, btn) {
      const r = ctx.store.transact((d) => startJob(d, job.id), 'start-job');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.message || 'Can\'t start that job', { type: 'error' }); return; }
      ctx.sfx.play('equip');
      ctx.sparkleBurst(btn, 8);
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function render() {
      const s = ctx.store.get();
      renderHead(s); renderActive(s); renderJobs(s);
    }
    render();
    let wasReady = isReady(ctx.store.get().activeJobs[c.id]);
    const unsubTick = ticker.subscribe((now) => {
      const a = ctx.store.get().activeJobs[c.id];
      if (!a) return;
      const ready = isReady(a, now);
      if (ready !== wasReady) { wasReady = ready; if (ready) ctx.sfx.play('reward'); renderActive(ctx.store.get()); return; }
      const t = activeBox.querySelector('.aj-time');
      if (t && !ready) t.textContent = formatDuration(remainingMs(a, now));
      setRing(activeBox, ratioDone(a, now));
    });
    const unsub = ctx.store.subscribe((s) => { if (s) { wasReady = isReady(s.activeJobs[c.id]); render(); } });
    return () => { unsubTick(); unsub(); };
  },
};
