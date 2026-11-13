# Technical Architecture

## Stack
HTML5 · CSS3 · vanilla ES modules · Vite (dev/build) · IndexedDB (saves) · Service worker
+ web manifest (offline PWA) · Vitest (+ fake-indexeddb) · Playwright (smoke test).
No frameworks, no backend. `base: './'` keeps the build portable for Capacitor.

## Layers
```
data/        pure catalogues & balance (no logic)         ← designers edit here
systems/     pure game logic over a state draft            ← unit-tested
components/  renderers (avatar, city, room, shop art), UI primitives (HUD, modal, toast, router)
screens/     one module per screen: { id, chrome, mount(el, params, ctx) → cleanup }
main.js      boot: load save → store → router → autosave → service worker
```

## State & transactions
`systems/gameState.js` holds a single serialisable state object and a tiny store:
`store.transact(fn)` structured-clones the state, runs `fn(draft)`, discards the draft if
it returns `{ok:false}`, otherwise commits atomically and notifies subscribers. This makes
every purchase (deduct + add item + ledger record) all-or-nothing.

## Save system (`systems/saveSystem.js`)
* IndexedDB `glamour-city` / store `saves`; key `slot1` + rolling backup `slot1-prev`
  written in the **same transaction**. localStorage fallback if IndexedDB is unavailable.
* Autosave is debounced (400 ms) on every state change; purchases call `saveNow()`
  immediately; `pagehide`/`visibilitychange` flush.
* `version` field + `MIGRATIONS[n]` chain + `fillDefaults` so old saves never crash new
  code; unknown catalogue ids are dropped on load.
* Idempotent rewards: grants carry a transaction id recorded in `ledger.processed`
  (e.g. `levelup:5`, `daily:2026-11-06`) so double taps / reloads / imports can't duplicate.
* Export/import JSON backups from Settings. Schema v6 adds `minigames`, `photos`,
  `homeContests` and `homeAwards`.

## Avatar rendering (`components/avatarRenderer.js`)
One inline SVG per render, composed from layers in a fixed order (see `docs/ASSETS.md`).
Clothing items are data (`shape` + colours + pattern + finish); shapes live in
`components/art/clothingArt.js` and are authored as left halves then mirrored, so they
always fit the shared body template. Item thumbnails reuse the same renderer on a "ghost"
mannequin with an auto-computed crop, guaranteeing shop icons match what you wear.
SVG was chosen over raster sprites for crisp Retina output, tiny downloads and the ability
to recolour/pattern any garment; Canvas will be used for photo export (M6) by rasterising
the same SVG.

## Timers, daily resets & quests
* Job timers are absolute timestamps in the save (`activeJobs[career] = {startedAt, endsAt}`);
  remaining time is always computed from `Date.now()`, so they survive navigation,
  backgrounding and restarts. A single shared 1 s `ticker` drives every countdown.
* Daily gift and daily quests reset at the player's **local midnight** (`utils/time.js`);
  weekly quests reset on Monday. Daily quest sets are seeded by the date, so they never
  reshuffle mid-day.
* Every payout (`job:<uid>`, `promo:<career>:<lvl>`, `daily:<date>`, `quest:<scope>:<period>:<id>`,
  `levelup:<n>`) goes through `grant()` and the ledger, so it can only happen once.
* Systems emit quest events (`job`, `jobCoins`, `buy`, `outfit`, `daily`, `promotion`,
  `restyle`) via `questSystem.recordEvent`; milestone quests read live state instead.

## Contests
`systems/competitionSystem.js` holds the scoring function, judge model, rival generator,
contest board and entry submission. All randomness is seeded from the contest uid
(`seededRandom`), so the same contest always produces the same rivals and judge scores —
useful for tests and for verifying results if contests ever move online. Entering is one
atomic transaction: rivals generated, everyone judged, prize granted under
`contest:<uid>`, history/trophies updated and the board slot replaced.

## Homes & decorating
* `propertySystem.js` — buy / move in / instant upgrades, and `perks()` (read by careers,
  contests and outfit limits).
* `furnitureInventory.js` — furniture *instances* (`f<n>` uids) with `at: null | {property, room}`;
  surfaces owned once.
* `decoratingSystem.js` — room zones, `clampPosition`, perspective `floorScale`, depth
  `drawOrder`, `findSpot`, place / move / flip / store / setSurface.
  Room layouts are the source of truth; on load the save system rebuilds every piece's `at`
  from them and drops duplicates, so a piece can never be in two places.
* `components/roomRenderer.js` draws a room as one SVG with `<g class="fitem" data-uid>` per
  piece; decorating mode drags those groups with pointer events (`touch-action: none`),
  converting screen points with `getScreenCTM()`, and commits on release.

## Relationships
`relationshipSystem.js` keeps `state.social` (relationship records with per-day counters,
partner, message threads, today's visitors). Points come from data: each choice's vibe ×
the character's `vibes` table (`gameBalance.social`). Story scenes are data keyed by level and
shown once. Male characters use `appearance.body = 'masc'`, which switches the renderer to
the masculine template in `art/mascArt.js` (same frame and anchors). The data model keeps
characters separate from player-specific relationship state, ready for real friends later.

## Minigames, photos & design awards
Game rules live in pure modules under `src/minigames/` (`memory.js`, `match3.js`,
`styling.js`) — no DOM, seeded RNG, fully unit-tested — and the screens in
`screens/arcade.js` only draw them. `minigameSystem.claimMinigame` pays each play once via
the ledger (`minigame:<uid>`). Photos are stored as small specs (look snapshot, pose,
backdrop, frame, cover) and re-rendered by `art/photoArt.js` into one self-contained SVG,
which `photoToPng` rasterises on a canvas for export. Home contests (`homeContestSystem.js`)
score rooms on five categories; rival entries are "ghost" states holding one generated
room, so the room renderer and the judge treat them exactly like the player's.

## Navigation
`components/navigation.js` routes between screen modules with slide/fade transitions and
a history stack. Each screen declares its chrome (HUD + tab bar, HUD only, or none).

## Future-proofing
* Online play: player-facing data (outfits, profile) is plain JSON; contests and friends
  will go through a `services/` adapter so a backend can replace the NPC simulators.
* Capacitor: no server-only APIs, relative asset paths, safe-area CSS, touch-first input.
