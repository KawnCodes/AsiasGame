/**
 * HOME DECORATING STYLES — ten themed interior collections. Furniture in a collection is
 * drawn from its palette and tagged with its id, so players can mix and match freely
 * while future home-design contests can reward coordinated rooms.
 * palette: main (body), accent (trim/details), wood (frames/legs), fabric (soft parts), metal.
 */
export const HOME_STYLES = [
  { id: 'pink_princess', name: 'Pink Princess', prefix: 'Princess', shop: 'glam_interiors', tier: 'glam',
    palette: { main: '#ffc2dc', accent: '#ffffff', wood: '#fff0f6', fabric: '#ff8fbd', metal: '#f2c86a' } },
  { id: 'modern_minimalist', name: 'Modern Minimalist', prefix: 'Nordic', shop: 'cosy_living', tier: 'cosy',
    palette: { main: '#f2f2f0', accent: '#2b2b2f', wood: '#d9c3a5', fabric: '#c9ccd2', metal: '#9aa0a8' } },
  { id: 'vintage_glamour', name: 'Vintage Glamour', prefix: 'Velvet Deco', shop: 'glam_interiors', tier: 'glam',
    palette: { main: '#8a2f44', accent: '#f2d27a', wood: '#5a3426', fabric: '#a8344c', metal: '#d9a640' } },
  { id: 'parisian_chic', name: 'Parisian Chic', prefix: 'Parisienne', shop: 'glam_interiors', tier: 'glam',
    palette: { main: '#f7efe6', accent: '#2d3d74', wood: '#e8dccb', fabric: '#c9b8d8', metal: '#c9a24e' } },
  { id: 'hollywood_luxury', name: 'Hollywood Luxury', prefix: 'Hollywood', shop: 'luxe_maison', tier: 'luxe',
    palette: { main: '#262030', accent: '#e6c27a', wood: '#2b2230', fabric: '#efe3c8', metal: '#e3b553' } },
  { id: 'pastel_dream', name: 'Pastel Dream', prefix: 'Cloud Nine', shop: 'glam_interiors', tier: 'glam',
    palette: { main: '#dccbff', accent: '#a9e8d2', wood: '#fff3e6', fabric: '#ffd6e5', metal: '#e9edf5' } },
  { id: 'coastal_beach', name: 'Coastal Beach House', prefix: 'Seaside', shop: 'cosy_living', tier: 'cosy',
    palette: { main: '#f6f1e7', accent: '#5a8de0', wood: '#d8b98d', fabric: '#bfe3f2', metal: '#c9ccd8' } },
  { id: 'royal_palace', name: 'Royal Palace', prefix: 'Royal', shop: 'luxe_maison', tier: 'luxe',
    palette: { main: '#3657b8', accent: '#f0c766', wood: '#f5ede0', fabric: '#8a2342', metal: '#e3b553' } },
  { id: 'romantic_cottage', name: 'Romantic Cottage', prefix: 'Rosebud', shop: 'cosy_living', tier: 'cosy',
    palette: { main: '#fff6ee', accent: '#e98fa9', wood: '#c99a6b', fabric: '#f2c6c6', metal: '#b07c52' } },
  { id: 'dark_academia', name: 'Dark Academia', prefix: "Scholar's", shop: 'cosy_living', tier: 'cosy',
    palette: { main: '#4a362b', accent: '#b08a4a', wood: '#3e2a20', fabric: '#6b2f2f', metal: '#b08a4a' } },
];

export const HOME_STYLE_BY_ID = Object.fromEntries(HOME_STYLES.map((s) => [s.id, s]));
