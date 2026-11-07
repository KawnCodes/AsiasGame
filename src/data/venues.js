/**
 * SOCIAL VENUES & DATES — where you meet people and go on dates.
 * styles: outfit tags that suit the venue (a matching outfit earns date bonus points).
 * beats: the conversation/activity choices on a date. Each choice has a "vibe"
 *        (sweet, funny, deep, bold, chic); each character likes different vibes.
 */
export const VENUES = [
  {
    id: 'cafe', name: 'Sugarplum Café', icon: '☕', location: 'cafe', cost: 200, styles: ['casual', 'romantic', 'pastel', 'chic'],
    blurb: 'Pastel macarons, frothy lattes and the cosiest window seats in the city.',
    beats: [
      { q: 'You squeeze into the window seat. What do you order?', choices: [
        { t: 'Two hot chocolates with extra marshmallows', v: 'sweet' },
        { t: 'Whatever is weirdest on the menu — lavender-chilli latte?', v: 'funny' },
        { t: 'An oat flat white, extra hot, no sugar', v: 'chic' },
      ] },
      { q: 'Rain starts tapping on the glass…', choices: [
        { t: '"Tell me something you\'ve never told anyone."', v: 'deep' },
        { t: '"Race you to the bakery across the road?"', v: 'bold' },
        { t: 'Draw a little heart in the window fog', v: 'sweet' },
      ] },
      { q: 'One last macaron is left on the plate.', choices: [
        { t: 'Split it perfectly in half', v: 'sweet' },
        { t: 'Challenge them to rock-paper-scissors for it', v: 'funny' },
        { t: 'Pop it in their mouth before they can argue', v: 'bold' },
      ] },
    ],
  },
  {
    id: 'restaurant', name: 'La Rosette', icon: '🌹', location: 'restaurant', cost: 600, styles: ['elegant', 'formal', 'romantic', 'glam'],
    blurb: 'Candlelight, white tablecloths and a violinist who takes requests.',
    beats: [
      { q: 'The waiter pours sparkling grape juice. Time for a toast!', choices: [
        { t: '"To new adventures!"', v: 'bold' },
        { t: '"To this exact moment."', v: 'deep' },
        { t: '"To the chef — and to you, obviously."', v: 'chic' },
      ] },
      { q: 'The violinist wanders over to your table.', choices: [
        { t: 'Request the most romantic song they know', v: 'sweet' },
        { t: 'Ask them to play a pop hit as a waltz', v: 'funny' },
        { t: 'Ask your date to dance between the tables', v: 'bold' },
      ] },
      { q: 'Dessert arrives — a single, perfect soufflé.', choices: [
        { t: 'Talk about your biggest dreams over dessert', v: 'deep' },
        { t: 'Rate it like strict TV judges', v: 'funny' },
        { t: 'Photograph it beautifully for your feed', v: 'chic' },
      ] },
    ],
  },
  {
    id: 'park', name: 'Heart Lake Park', icon: '💞', location: 'park', cost: 0, styles: ['casual', 'summer', 'boho', 'sporty', 'romantic'],
    blurb: 'A heart-shaped lake, rowing boats and the best sunsets in Glamour City.',
    beats: [
      { q: 'There\'s a little rowing boat for hire.', choices: [
        { t: 'Row out to the middle and just float', v: 'deep' },
        { t: 'Insist on rowing — and go in circles', v: 'funny' },
        { t: 'Race the swans to the island', v: 'bold' },
      ] },
      { q: 'You find the perfect spot for a picnic.', choices: [
        { t: 'Unpack homemade sandwiches cut into hearts', v: 'sweet' },
        { t: 'Lay out a chic picnic with fruit and flowers', v: 'chic' },
        { t: 'Cloud-watch and name every shape', v: 'funny' },
      ] },
      { q: 'The sun begins to set over the lake.', choices: [
        { t: 'Lean on their shoulder and watch quietly', v: 'sweet' },
        { t: 'Make a wish on the first star', v: 'deep' },
        { t: 'Kick off your shoes and paddle at the edge', v: 'bold' },
      ] },
    ],
  },
  {
    id: 'club', name: 'The Social Club Rooftop', icon: '🌃', location: 'social', cost: 400, styles: ['glam', 'edgy', 'street', 'chic'],
    blurb: 'Fairy lights, a skyline view and the city\'s best mocktails.',
    beats: [
      { q: 'The DJ drops your favourite song.', choices: [
        { t: 'Pull your date onto the dance floor', v: 'bold' },
        { t: 'Do a deliberately terrible robot dance', v: 'funny' },
        { t: 'Sway together by the railing', v: 'sweet' },
      ] },
      { q: 'You find a quiet corner with a view of the city lights.', choices: [
        { t: '"Where do you see yourself in five years?"', v: 'deep' },
        { t: 'Point out your future penthouse', v: 'chic' },
        { t: '"Bet I can name every building."', v: 'funny' },
      ] },
      { q: 'There\'s a photo booth by the bar.', choices: [
        { t: 'Pull silly faces in every frame', v: 'funny' },
        { t: 'Strike a glamorous magazine pose', v: 'chic' },
        { t: 'Sneak a kiss on the cheek in the last frame', v: 'bold' },
      ] },
    ],
  },
];
export const VENUE_BY_ID = Object.fromEntries(VENUES.map((v) => [v.id, v]));
