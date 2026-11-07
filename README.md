# Glamour City ✦

An original HTML5 fashion, celebrity & lifestyle simulation game: dress up, shop, and
rise from unknown hopeful to fashion icon. Vanilla JavaScript + CSS, built with Vite,
installable as an offline PWA, structured for later Capacitor (iOS) packaging.

> **Status: Milestone 2 (careers & fast progression) on top of the Milestone 1 foundation.** See `docs/ROADMAP.md` for what is built
> and what comes next.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173 — open on your phone via the LAN URL Vite prints
```

Production build + preview (the service worker / offline mode only runs in production):

```bash
npm run build
npm run preview      # http://localhost:4173
```

## Test it

```bash
npm test             # unit tests (economy, XP, inventory, careers, daily, quests, saves)
npm run build && npm run smoke   # two browser playthroughs at iPhone size, writes ./screenshots
```

`npm run smoke` and `npm run icons` use Playwright (installed globally in this
environment; otherwise `npm i -D playwright && npx playwright install chromium`).

## Install on iPhone

Open the production URL in Safari → Share → **Add to Home Screen**. After the first
launch the game works offline.

## Where things live

| Path | What |
|---|---|
| `src/data/gameBalance.js` | **Every economy number** — balances, XP curve, rewards, price bands |
| `src/data/clothing.js` | Clothing catalogue (one line per item) |
| `src/data/careers.js`, `quests.js` | Careers, jobs, mentors' story beats, quests |
| `src/data/appearance.js` | Skin tones, face features, hairstyles, dyes, makeup |
| `src/data/shops.js`, `locations.js` | Shops, shopkeepers and the city map |
| `src/systems/` | Game logic (pure functions over state) + IndexedDB save system |
| `src/components/art/` | Procedural vector art: body, hair, clothing, city, rooms |
| `src/screens/` | One module per screen |
| `docs/` | Game design, architecture, roadmap, asset register |
