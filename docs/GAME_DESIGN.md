# Glamour City — Game Design Document (concise)

## Pitch
A nostalgic, glamorous 2010s-style fashion life sim — an original spiritual successor to
classic iPhone dress-up/celebrity games — with **fast progression and a generous economy**:
no hours-long timers, no real-money purchases, no forced ads.

## Player fantasy
Arrive in Glamour City as an unknown hopeful with a tiny apartment and a few outfits.
Work glamorous 30-second jobs, shop, style, compete, fall in love, buy homes and decorate
them, and become a fashion icon.

## Core loop
**Work → Earn → Shop → Style → Compete → Fame → Level up → Unlock → Buy homes → Decorate → New stories**

Several activities are always available so the player is never forced down one path.

## Pillars
1. **Beautiful dress-up** — a layered fashion-doll avatar where every item renders consistently.
2. **Generous & fast** — rewards every few minutes; level 5 in a short first session.
3. **Collect & express** — hundreds of data-driven items with rarities and style tags.
4. **A living city** — illustrated, tappable locations unlocked as fame grows.
5. **Home as a stage** — homes to buy, decorate and show off.

## Economy (all values in `src/data/gameBalance.js`)
| Item | Value |
|---|---|
| Start | 5,000 coins · 100 gems · level 1 · free starter apartment & wardrobe |
| Jobs | beginner 10–15 s → 220 c + 45 XP · standard 30 s → 500 c + 100 XP · pro 40–45 s → 850 c + 170 XP · celebrity 60 s → 1,600 c + 320 XP; +25 % with a matching outfit |
| Level 1 → 2 | 500 XP; `requiredXP = round(500 × 1.12^(level−1))` |
| Level-up | 500 coins + 5 gems (granted once per level, ledger-guarded) |
| Daily gift | 1,000 coins + 10 gems (day 1) rising to 3,000 + 30 on day 7; local calendar day reset |
| Minigame (M6) | 250 coins + 50 XP |
| Contests | finish ≥ 200 coins · 3rd 500 · 2nd 800 + 5 gems · win 1,500 + 20 gems; City ×1.6, Gala ×2.5; theme of the day +50 % coins |
| Career promotion | 2,000 coins + 15 gems per career level |
| Quests | daily 300–800 coins, weekly 1,000–2,500 + gems, milestones up to 5,000 + 40 gems |
| Resale (M6) | 50 % of price |

Price bands: tops 100–300, skirts/trousers 150–500, dresses 300–1,000, premium dresses
1,000–3,000, shoes 100–600, hairstyles 200–800, accessories 50–400. Rare+ items may exceed
their band (×2.5 cap). A few legendary items cost gems, which are earned through play.

## Style system
Every clothing item, hairstyle and makeup product carries **style tags** (casual, chic,
glam, romantic, sporty, vintage, edgy, princess, summer, winter, elegant, street, luxury,
pastel, boho, formal) and a **rarity** (common → legendary). Milestone 3's pageant judge
scores theme match from tags, colour harmony from item colours, rarity, completeness
(hair/makeup/accessories) and creativity (tag variety).

## Fashion contests
Ten themes, three tiers, three judges. Each look is scored 0–10 in eight categories
(theme, coordination, colour harmony, hairstyle, makeup, accessories, rarity, creativity);
each judge weights them differently and gives 1–10, for a total out of 30. Rivals are
generated from the same catalogue with tier-based skill and scored by the same code, so
better shopping and styling genuinely win more often.

## City districts
Rosewood Street (home, café) · Boutique Avenue (5 fashion shops + salon) · Star Boulevard
(makeup studio, agency, music & film studios, Grand Pavilion) · Romance Riverside
(restaurant, park, arcade, social club) · Luxury Hills (realty, furniture).

## Original cast (so far)
Contest judges: **Madame Céleste**, **Rio Vega**, **Lady Primrose Ashby**. Career mentors: **Vivienne Belle** (modelling), **DJ Marlowe** (singing), **Director
Okafor** (acting). Shopkeepers: **Poppy** (Petal & Thread), **Madame Céleste** (Maison Étoile), **Jade**
(Stiletto Lane), **Opal** (Glimmer Jewellers), **Marigold** (The Ribbon Box), **Coco**
(Silk & Curl Salon), **Bijou** (Blush Studio). Romanceable NPCs and friends arrive in M5.

## Content & tone
Wholesome, playful, age-appropriate. Fictional brands, magazines and characters only.
