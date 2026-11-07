# Development Roadmap

| # | Milestone | Status |
|---|---|---|
| 1 | Playable foundation | Done |
| 2 | Fast careers & progression (jobs, timers, XP/levels, fame, daily rewards, promotions, quests) | Done |
| 3 | Fashion competitions (themes, AI contestants, judging, rankings, rewards) | **Done (this build)** |
| 4 | Property & home decorating (agency, buying, furniture shops, drag-and-drop, upgrades) | Next |
| 5 | Relationships & social (romance NPCs, dialogue, dates, messages, friends, visits, parties) | Planned |
| 6 | Minigames & extras (memory, match-3, styling challenge, photoshoots, covers, resale) | Planned |
| 7 | Polish & release (content expansion, audio, tutorial, accessibility, perf, regression tests) | Planned |

## Milestone 1 — delivered
* Vite project, mobile-first responsive layout (phone frame on desktop), safe-area aware.
* Visual design system: glossy buttons, ribbons, chips, cards, sparkles, transitions.
* Welcome screen with Continue / New Game.
* Character creator: skin (8), face (4), eyes (4) + colour (8), brows (4), nose (3), lips (4),
  hairstyles (11; 4 free), hair colours (13; 7 free), eyeshadow, eyeliner, lipstick, blush,
  starter outfit, name, "Surprise me"; face tabs zoom in. Re-openable later from the mirror.
* Layered SVG avatar with 58 garment & accessory shapes, 10 patterns, satin/glitter/sheer finishes.
* 131 clothing items across 14 categories, rarities and style tags.
* Illustrated city map: 5 districts, 19 locations (9 open, the rest marked "Soon" with
  the update that opens them).
* Starter apartment hub with hotspots (wardrobe, vanity, mirror, bed = save & rest).
* Wardrobe: filters, favourites, equip/unequip with dress↔top/bottom rules, undress,
  saved looks (save/apply/favourite/delete).
* 7 shops (clothing, luxury, shoes, jewellery, accessories, salon, makeup) with original
  shopkeepers, try-on preview, coin & gem prices, confirm-to-buy, duplicate protection,
  "Wear it now".
* Coins/gems/level HUD, profile, settings (sound, reduced motion, export/import, reset).
* IndexedDB saves with migrations, backup slot, autosave; PWA manifest, icons, offline SW.
* 38 unit tests + 16-check browser smoke test.

## Milestone 2 — delivered
* **Three careers** (Modelling, Singing, Acting), six jobs each, four tiers:
  beginner 10–15 s · standard 30 s (500 coins + 100 XP) · pro 40–45 s · celebrity 60 s.
  Singing unlocks at level 2, acting at level 3; better jobs unlock with career level.
* **Wall-clock timers**: each running job stores `startedAt/endsAt`, so countdowns keep going
  across navigation, reloads and app restarts. One job per career → up to three at once.
  A global ticker shows "job done" toasts on any screen and badges the Work tab.
* **Style bonus**: +25 % coins when 2+ worn items match the job's style tags (fashion ↔ work).
* **Career levels 1–10** with titles, progress bars, promotions (2,000 coins + 15 gems,
  ledger-guarded) and mentor story beats at levels 2, 3, 5, 7, 10 (Vivienne Belle,
  DJ Marlowe, Director Okafor).
* **XP & levels**: HUD XP bar, level-up celebration (500 coins + 5 gems) listing unlocks.
* **Fame** from every job; fame titles on the profile.
* **Daily gift**: local-calendar-day reset, 7-day streak (1,000 → 3,000 coins, 10 → 30 gems),
  streak resets after a missed day, auto-pops once per session, duplicate-proof.
* **Quests**: 3 daily (deterministic rotation per date, level-aware), 3 weekly (Monday
  reset), 16 long-term milestones across Fashion / Careers / Fame, all with claim flows.
* City: Belle Model Agency, Starlight Records and Silver Screen Studios open (level-gated
  with a 🔒 LV ribbon). Six-tab navigation: Home · City · Work · Quests · Closet · Shops.
* Save schema v2 with migration from Milestone 1 saves.
* Tests: 62 unit tests + 16-check (M1) and 20-check (M2) browser playthroughs.

Measured pacing (optimal play, all careers in parallel): level 2 ≈ 3 min, level 5 ≈ 6 min,
level 10 ≈ 13 min.

## Milestone 3 — delivered
* **Grand Pavilion** opens on Star Boulevard (also reachable from Home → Fashion contests).
* **10 themes**: Red Carpet Glamour, Summer Chic, Royal Princess, Romantic Date, Vintage
  Hollywood, Elegant Evening, Winter Wonderland, Street Style, Pastel Princess, Luxury
  Fashion — each with weighted style tags, a colour palette and signature makeup.
* **Contest board**: 4 open contests that refill instantly after you enter (no waiting),
  one of them the seeded *theme of the day* (+50 % coins).
* **Three tiers**: Rising Star (level 1), City Showcase (level 4, ×1.6 prizes), Grand Gala
  (level 8, ×2.5 prizes, toughest rivals).
* **Dressing room**: theme brief, palette, judges' checklist, ♥ theme-match markers on
  your clothes, quick hair / hair-colour / makeup changes.
* **Real scoring** (`systems/competitionSystem.js`), eight 0–10 categories: theme,
  coordination, colour harmony (palette distance + hue count), hairstyle, makeup,
  accessories, rarity, creativity (style breadth, patterns/finishes; repeating your last
  entry costs points).
* **Three NPC judges** (Madame Céleste, Rio Vega, Lady Primrose Ashby) weight categories
  differently, score 1–10 and each comments on a different aspect of your look.
* **AI rivals** built from the full catalogue with tier-based skill, scored by the same code.
* **Presentation**: runway walk (skippable), judges' scorecards + breakdown, podium,
  full ranking, rewards: win 1,500 coins + 20 gems; 2nd 800 + 5; 3rd 500; everyone ≥ 200.
* **Trophies** for top-3 finishes appear on the apartment shelf (tap for the list).
* **Guest judge**: pick the stronger of two looks; 75 coins per correct call, 10 a day.
* Contest quests (daily, weekly, 5 milestones) and profile stats; save schema v3.
* Tests: 86 unit tests; browser playthroughs M1 (16), M2 (20), M3 (17 checks).

Calibration (simulated, 200 contests per tier): a well-styled *starter* wardrobe wins
~28 % of Rising Star contests; a styled budget wardrobe ~90 % Rising / ~68 % City /
~52 % Gala; best-in-catalogue looks ~65 % of Gala contests.

## Milestone 4 — plan
Property agency (8 homes, 5,000 → 300,000 coins), multiple owned homes and "move in",
room scenes per property, furniture catalogue + 4 furniture shops, furniture inventory,
touch drag-and-drop decorating with bounds/anchors/layering, rotate/store/remove,
wallpaper/wall colour/flooring, instant home upgrades, persistent layouts (save v4).
