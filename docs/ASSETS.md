# Asset Register & Character Template

## Honest status
All artwork in this build is **original procedural vector art** generated in code
(`src/components/art/*`). It is consistent and shippable as a stylised look, but it is
**temporary art** where noted below — final illustrated assets should replace it.
No external image URLs are used; everything works offline.

| Asset group | Source | Status |
|---|---|---|
| Avatar body, face, makeup | `art/bodyArt.js` | Temporary — replace with illustrated layers |
| Hairstyles (11) | `art/hairArt.js` | Temporary |
| Garments & accessories (58 shapes) | `art/clothingArt.js` | Temporary |
| City buildings (10 kinds) | `art/cityArt.js` | Temporary |
| Room architecture, wallpapers, floors, window views | `components/roomRenderer.js` | Temporary |
| Furniture (39 types × palettes) | `art/furnitureArt.js` | Temporary |
| Property exteriors (8) | `art/propertyArt.js` | Temporary |
| Runway stage | `art/runwayArt.js` | Temporary |
| Masculine body, short hair, menswear | `art/mascArt.js` | Temporary |
| Venue scenes (café, restaurant, park, rooftop club) | `art/venueArt.js` | Temporary |
| Shop interiors & banners | `art/shopArt.js` | Temporary |
| Icons (UI) | `components/icons.js` | Final-quality vector icons |
| App icon | `public/icons/icon.svg` (+ PNGs via `npm run icons`) | Temporary |
| Fonts | Quicksand, Playfair Display, Parisienne (OFL, bundled via @fontsource) | Final |
| Sound effects | Synthesised (Web Audio) in `components/audio.js` | Temporary |
| Building/shop emblems | Unicode emoji (rendered by the device font) | Temporary |

## Character template (for artists)
* Canvas: **200 × 440** units, origin top-left, vertical centre line **x = 100**, feet at y ≈ 430.
* Anchors: head top 24 · eyes 67 (L 88 / R 112) · lips 91 · chin 106 · neck base 124 ·
  shoulders (69,136)/(131,136) · waist 194 (x 85–115) · hips 230 (x 78–122) · crotch 252 ·
  knees 322 · ankles 402 · toes 430 · wrists (57,250)/(143,250) · hands (54,263)/(146,263) ·
  earlobes (68.5,75)/(131.5,75).
* Every layer is exported at the full 200 × 440 frame so layers align without offsets.

## Render order (back → front)
1 hair-back · 2 body (legs, feet, torso, neck) · 3 modest base layer · 4 shoes · 5 bottom ·
6 top · 7 dress · 8 outerwear · 9 necklace · 10 arms · 11 sleeves (top → dress → outerwear) ·
12 bracelet · 13 bag (right hand) · 14 head, face & makeup · 15 earrings · 16 hair-front ·
17 hair accessory.

## Replacing art with illustrations
Add an optional `art: 'assets/clothing/<id>.webp'` (and `sleeves:` for sleeve layers) to a
catalogue item; the renderer should emit an `<image>` at the full template frame in the
same layer slot. Keep the procedural shape as a fallback.

## Room template (furniture artists)
Rooms are 390 × 420 units: wall y 22–280, floor y 300–416. Floor pieces are drawn with their
anchor at bottom-centre (art spans x −w/2..w/2, y −h..0); wall pieces and rugs are anchored
at their centre. Footprints (w × h) per furniture type live in `FURNITURE_KINDS`
(`src/data/furniture.js`). Floor pieces are scaled 0.78–1.0 by depth.
