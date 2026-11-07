/**
 * CHARACTERS — original romanceable NPCs and friends (all adults; wholesome storylines).
 *
 * vibes   : how much a character enjoys each conversational vibe (−2 … +2). Every dialogue
 *           choice is tagged with a vibe, so the same choice lands differently per person.
 * gifts   : love / like / dislike lists of gift ids (data/gifts.js)
 * topics  : personal conversation topics with written replies per choice
 * flirts  : romance only — playful exchanges (unlocked at "Friend")
 * story   : scenes unlocked at relationship levels (romantic scenes / friendship moments)
 * texts   : phone messages they send
 * home    : venue id where you usually find them ('also' = venues they sometimes visit)
 * house   : friends only — the home you can visit (property look + furniture style)
 */
export const VIBES = {
  sweet: { name: 'Sweet', icon: '💗' }, funny: { name: 'Funny', icon: '😄' }, deep: { name: 'Deep', icon: '🌙' },
  bold: { name: 'Bold', icon: '🔥' }, chic: { name: 'Chic', icon: '✨' },
};

export const ROMANCE_LEVELS = [
  { min: 0, name: 'Stranger' }, { min: 20, name: 'Acquaintance' }, { min: 60, name: 'Friend' }, { min: 120, name: 'Crush' },
  { min: 200, name: 'Close' }, { min: 320, name: 'Sweetheart' }, { min: 500, name: 'Soulmate' },
];
export const FRIEND_LEVELS = [
  { min: 0, name: 'Stranger' }, { min: 20, name: 'Acquaintance' }, { min: 60, name: 'Friend' }, { min: 140, name: 'Good Friend' }, { min: 260, name: 'Best Friend' },
];

const M = (skin, hairStyle, hairColor, eyes, eyeColor) => ({ body: 'masc', skin, hairStyle, hairColor, eyes, eyeColor, face: 'soft_square', nose: 'slim' });

export const CHARACTERS = [
  // ===================================================================== romance
  {
    id: 'leo', kind: 'romance', name: 'Leo Valen', age: 24, job: 'Singer-songwriter', home: 'cafe', also: ['park'],
    bio: 'Plays acoustic sets at Sugarplum Café on Thursdays and writes lyrics on napkins. Signed to Starlight Records last spring — still can\'t quite believe it.',
    look: { appearance: M('golden', 'm_crop', 'dark_brown', 'almond', 'brown'), equipped: { top: 'm_tee_white', outerwear: 'm_leather_black', bottom: 'm_jeans_black', shoes: 'm_boots_brown' } },
    vibes: { deep: 2, funny: 1, sweet: 1, bold: -1, chic: -1 },
    gifts: { love: ['vinyl', 'tickets'], like: ['film_roll', 'candle', 'sketchbook'], dislike: ['perfume'] },
    intro: 'Oh — hi! Sorry, I was miles away. Writing a chorus about rain on café windows. I\'m Leo. Do you come here often, or is that the most clichéd line ever?',
    reactions: {
      great: ['Ha — I\'m writing that down. Seriously.', 'You get it. You really get it.', 'That might be the best thing anyone\'s said to me all week.'],
      ok: ['Fair enough!', 'Mm, I like that.', 'Nice.'],
      bad: ['Oh… okay, sure.', 'Huh. Not really my thing, but okay!', 'Right… moving on!'],
    },
    topics: [
      { q: 'If your life had a soundtrack, what would be playing right now?', choices: [
        { t: 'Something slow and dreamy, like rain on a window', v: 'deep', r: 'Rain songs are the best songs. We\'d make a good playlist together.' },
        { t: 'The intro music of a sitcom', v: 'funny', r: 'Ha! Cue the laugh track. I love that.' },
        { t: 'A runway remix, obviously', v: 'chic', r: 'Very glamorous. I\'m more of a three-chords-and-a-feeling guy.' },
      ] },
      { q: 'I\'m nervous about my first big concert. Any advice?', choices: [
        { t: 'Sing to one person in the crowd — pretend it\'s just them', v: 'deep', r: '…That\'s exactly what I needed to hear. Maybe I\'ll sing to you.' },
        { t: 'Picture everyone in fluffy bunny slippers', v: 'funny', r: 'Bunny slippers. I\'m never unseeing that. Thank you!' },
        { t: 'Walk out like you own the place', v: 'bold', r: 'Easy for you to say — you light up every room!' },
      ] },
      { q: 'What do you miss most when you\'re busy?', choices: [
        { t: 'Lazy Sunday mornings with nowhere to be', v: 'sweet', r: 'Pancakes, a record playing… yeah. Same.' },
        { t: 'Having time to just think', v: 'deep', r: 'Thinking time is underrated. That\'s where the songs come from.' },
        { t: 'Nothing — busy means it\'s working!', v: 'bold', r: 'Wow. You\'re a powerhouse. I\'d need a nap.' },
      ] },
    ],
    flirts: [
      { q: 'You know, I wrote a new song last night. Want to guess who inspired it?', choices: [
        { t: '"Is it about a girl who orders too many macarons?"', v: 'funny', r: 'Maybe. Possibly. Definitely.' },
        { t: '"I hope it\'s me."', v: 'bold', r: '…Okay, you\'ve caught me.' },
        { t: '"Play it for me sometime?"', v: 'sweet', r: 'Only if you promise not to laugh at the high note.' },
      ] },
      { q: 'Is it weird that I look forward to Thursdays now? Because you might come by.', choices: [
        { t: '"I look forward to them too."', v: 'sweet', r: 'Then it\'s a date. Every Thursday.' },
        { t: '"I\'ll come every day if there\'s a free song in it."', v: 'funny', r: 'Deal. I\'ll write faster.' },
        { t: '"Thursdays are fine, I guess."', v: 'chic', r: 'Oh. Cool. Cool cool cool.' },
      ] },
    ],
    story: {
      2: { title: 'Napkin Lyrics', text: 'Leo slides a napkin across the table. In messy handwriting: "Café lights and someone new / the chorus keeps on turning into you." He goes very red. "Draft one. Don\'t judge."' },
      3: { title: 'First Listen', text: 'After closing, Leo plays you his new song on the café piano. The chairs are stacked, the lights are low, and he keeps glancing over to see if you like it. You do. A lot.' },
      4: { title: 'Backstage Pass', text: 'Leo hands you a laminated pass. "Big show next week. I want you side-stage. I\'ll sing better if you\'re there." He means it.' },
      5: { title: 'The Song Is Yours', text: 'On stage at the Grand Pavilion, Leo stops mid-set. "This next one\'s new. It\'s for someone special." He looks straight at you as the first chord rings out.' },
    },
    ask: { yes: 'Leo actually drops his guitar pick. "Yes. Yes! I\'ve been trying to work up the courage to ask YOU for weeks."', no: '"I really like you… but maybe let\'s get to know each other a little more first?"' },
    texts: {
      morning: ['Morning ☀️ woke up with a melody stuck in my head. Your fault probably.', 'Coffee + you later? ☕'],
      miss: ['The café isn\'t the same without you today.', 'Played your favourite song three times. Miss you.'],
      congrats: ['YOU WON?! I\'m writing you a victory song 🎸', 'Saw the photos — you looked incredible. So proud.'],
      invite: ['Open mic at Sugarplum tonight. Save me a seat?'],
    },
  },
  {
    id: 'theo', kind: 'romance', name: 'Theo Marchetti', age: 25, job: 'Pastry chef', home: 'cafe', also: ['restaurant'],
    bio: 'The flour-dusted genius behind Sugarplum Café\'s famous strawberry tarts. Trained in Paris, homesick for his nonna\'s kitchen, and terrible at taking compliments.',
    look: { appearance: M('peach', 'm_curls', 'chestnut', 'doe', 'green'), equipped: { top: 'm_knit_cream', bottom: 'm_chinos_sand', shoes: 'm_sneakers_white' } },
    vibes: { sweet: 2, funny: 1, deep: 1, bold: -1, chic: -1 },
    gifts: { love: ['cookbook', 'roses'], like: ['cupcakes', 'candle', 'succulent'], dislike: ['surf_wax'] },
    intro: 'Bonjour! Sorry — flour everywhere, I know. I\'m Theo. Have you tried the strawberry tart? No? Wait right there. You\'re trying the strawberry tart.',
    reactions: {
      great: ['Aww. You\'re making me blush — and I\'m standing next to an oven.', 'That\'s lovely. Really lovely.', 'You\'re sweeter than my macarons, you know that?'],
      ok: ['Ha, okay!', 'I like that.', 'Mm, fair.'],
      bad: ['Oh. Right. Okay.', 'Hmm… not sure about that one.', 'If you say so!'],
    },
    topics: [
      { q: 'What\'s your favourite dessert? Be honest — I\'m a professional.', choices: [
        { t: 'Anything homemade, made with love', v: 'sweet', r: 'Exactly the right answer. Love is the secret ingredient.' },
        { t: 'Cereal at midnight', v: 'funny', r: 'Ha! A woman of the people. I respect it.' },
        { t: 'A perfect, minimalist lemon tart', v: 'chic', r: 'Ooh, elegant. Tricky to get right though.' },
      ] },
      { q: 'Sometimes I wonder if I should open my own bakery. Is that crazy?', choices: [
        { t: 'Not crazy at all — you\'d make the whole city happier', v: 'sweet', r: 'You really think so? …Maybe I\'ll start saving.' },
        { t: 'What would your nonna say?', v: 'deep', r: '"Finalmente!" probably. She\'s been telling me for years.' },
        { t: 'Just quit tomorrow and do it!', v: 'bold', r: 'Ha — I need a business plan first. And a lot of flour.' },
      ] },
      { q: 'I burned an entire batch of croissants today.', choices: [
        { t: 'Even chefs have bad days. Tomorrow\'s batch will be perfect', v: 'sweet', r: 'Thanks. That actually helps.' },
        { t: 'Rebrand them as "crispy croissants"', v: 'funny', r: 'Crispy croissants! The marketing genius!' },
        { t: 'Were they at least photogenic?', v: 'chic', r: 'Charcoal-chic? Not really my look.' },
      ] },
    ],
    flirts: [
      { q: 'I made a new recipe. I named it after you. Don\'t laugh.', choices: [
        { t: '"What does it taste like?"', v: 'sweet', r: 'Sweet, a little surprising, and impossible to stop thinking about.' },
        { t: '"It better be the best thing on the menu."', v: 'bold', r: 'It is. Obviously.' },
        { t: '"Does it come with free refills?"', v: 'funny', r: 'For you? Lifetime supply.' },
      ] },
      { q: 'You have a little icing sugar on your cheek. Here — let me…', choices: [
        { t: 'Smile and let him', v: 'sweet', r: 'There. Perfect. You\'re… perfect.' },
        { t: '"Did you put it there on purpose?"', v: 'funny', r: 'I would never! …Maybe.' },
        { t: 'Wipe it yourself, quickly', v: 'chic', r: 'Oh — right. Of course.' },
      ] },
    ],
    story: {
      2: { title: 'Kitchen Lessons', text: 'Theo ties an apron around you and teaches you to pipe rosettes. Yours look like little clouds. He insists they\'re "artistic" and puts them in the window display.' },
      3: { title: 'Nonna\'s Recipe', text: 'He shows you a stained, handwritten recipe card. "Nonna\'s tiramisu. I\'ve never made it for anyone." He makes it for you.' },
      4: { title: 'After Hours', text: 'The café is closed, the chairs are up, and Theo has laid one table with candles and two forks. "Taste test," he says. It isn\'t really about the cake.' },
      5: { title: 'A Bakery of Our Own', text: 'Theo shows you a tiny empty shop with "FOR LEASE" in the window. "I\'m doing it. And I want the first thing in the window to be named after you."' },
    },
    ask: { yes: 'Theo goes pink right up to his ears. "Sì — I mean, yes! Absolutely yes. I\'m making you a celebration cake."', no: '"You\'re wonderful… but let\'s take it slow, like a good bread. Is that okay?"' },
    texts: {
      morning: ['Fresh croissants at 7. I saved you the best one 🥐', 'Buongiorno! The tarts came out perfect today.'],
      miss: ['Made too many cupcakes thinking about you. Come help eat them?', 'The café smells like vanilla and it reminds me of you.'],
      congrats: ['A TROPHY! Celebration cake incoming 🎂', 'Nonna says congratulations too (I told her all about you).'],
      invite: ['Testing new flavours tonight — want to be my official taster?'],
    },
  },
  {
    id: 'kai', kind: 'romance', name: 'Kai Nakamura', age: 23, job: 'Surf photographer', home: 'park', also: ['club'],
    bio: 'Spends sunrises in the sea and sunsets developing film. His photos of Seashell Point went viral, and now every magazine wants him — he\'d rather be in the water.',
    look: { appearance: M('honey', 'm_bun', 'black', 'almond', 'dark'), equipped: { top: 'm_shirt_floral', bottom: 'm_jeans_blue', shoes: 'm_sneakers_white', bracelet: 'm_watch_steel' } },
    vibes: { bold: 2, funny: 2, deep: 0, sweet: 0, chic: -1 },
    gifts: { love: ['film_roll', 'surf_wax'], like: ['tickets', 'cupcakes', 'vinyl'], dislike: ['silk_scarf'] },
    intro: 'Whoa — hold that pose! The light on the lake behind you is unreal. …Sorry, I\'m Kai. Occupational hazard. Mind if I send you the photo?',
    reactions: {
      great: ['Ha! Yes! That\'s the energy.', 'You\'re fun. Like, actually fun.', 'Okay, you\'re officially my favourite person today.'],
      ok: ['Cool, cool.', 'Fair!', 'Nice.'],
      bad: ['Eh… bit fancy for me.', 'Hm. Okay.', 'Not sure I follow, but sure!'],
    },
    topics: [
      { q: 'If you could be anywhere in the world right now, where?', choices: [
        { t: 'Cliff-jumping somewhere tropical', v: 'bold', r: 'YES. I know a spot. Don\'t tell anyone.' },
        { t: 'Somewhere with unlimited snacks', v: 'funny', r: 'Honestly the dream. Beach snacks hit different.' },
        { t: 'A rooftop bar in Paris', v: 'chic', r: 'Fancy! I\'d probably spill something.' },
      ] },
      { q: 'A magazine offered me a fancy studio contract. Feels like a cage though.', choices: [
        { t: 'Then don\'t take it — shoot what you love', v: 'bold', r: 'Right? Life\'s too short for studios.' },
        { t: 'What would make you happiest in five years?', v: 'deep', r: 'Hmm. Good question. Ocean, camera, people I like. Simple.' },
        { t: 'Take it and buy a boat with the money', v: 'funny', r: 'Ha! The boat plan. I like the way you think.' },
      ] },
      { q: 'I fell off my board in front of everyone today.', choices: [
        { t: 'Did anyone get a photo? I need to see it', v: 'funny', r: 'Ha! My buddy did. It\'s legendary. I\'ll show you.' },
        { t: 'Get back out there tomorrow!', v: 'bold', r: 'Already planning it. Sunrise session?' },
        { t: 'Are you okay? That sounds awful', v: 'sweet', r: 'Aw, I\'m fine! Just my pride, haha.' },
      ] },
    ],
    flirts: [
      { q: 'Okay, real talk: you\'ve been in like half my camera roll lately.', choices: [
        { t: '"Only half? Step it up."', v: 'bold', r: 'Ha! Challenge accepted.' },
        { t: '"Is that why you keep saying the light is good?"', v: 'funny', r: 'The light IS good. You\'re just… better.' },
        { t: '"That\'s really sweet."', v: 'sweet', r: 'Yeah? Cool. Cool. I\'m smiling way too much.' },
      ] },
      { q: 'I\'ll teach you to surf. Fair warning, you will fall in. A lot.', choices: [
        { t: '"Only if you fall in with me."', v: 'bold', r: 'That\'s… honestly the plan.' },
        { t: '"I\'ll bring a fabulous swimsuit."', v: 'chic', r: 'Ha. Sure. Maybe one that stays on in waves?' },
        { t: '"Loser buys ice cream."', v: 'funny', r: 'You\'re on. I\'m going to lose on purpose.' },
      ] },
    ],
    story: {
      2: { title: 'Golden Hour', text: 'Kai hands you his camera. "Your turn." You take a blurry, wonky photo of him laughing. He says it\'s the best picture anyone has ever taken of him, and makes it his lock screen.' },
      3: { title: 'Sunrise Session', text: 'At 5 a.m., wrapped in a towel on the beach, you watch Kai catch wave after wave. He paddles in grinning: "Every time I stood up, I looked for you."' },
      4: { title: 'The Darkroom', text: 'In the red light of his darkroom, a photo slowly appears in the tray: you, mid-laugh, hair everywhere. "That one\'s not for any magazine," Kai says quietly. "That one\'s mine."' },
      5: { title: 'Exhibition', text: 'Kai\'s first gallery show opens at the Social Club. The centrepiece, two metres tall, is titled "My Favourite View". It\'s you.' },
    },
    ask: { yes: 'Kai whoops so loud the ducks scatter. "Yes! Obviously yes! I was literally about to ask you!"', no: '"Ha, whoa — I like you heaps! Can we hang out a bit more first?"' },
    texts: {
      morning: ['Waves are perfect today 🌊 you should come watch', 'Sunrise pic for you 🌅'],
      miss: ['Saw a cloud shaped like your hair. Weird day. Miss you', 'Beach is boring without you tbh'],
      congrats: ['CHAMP!! 🏆 framing your photo rn', 'Knew you\'d smash it 🤙'],
      invite: ['Bonfire at the lake later? Bringing marshmallows'],
    },
  },
  {
    id: 'julian', kind: 'romance', name: 'Julian Ashford', age: 26, job: 'Actor', home: 'restaurant', also: ['club'],
    bio: 'Leading man at Silver Screen Studios and a regular at La Rosette\'s corner table. Quotes old films, owns too many blazers, secretly volunteers at the animal shelter.',
    look: { appearance: M('cocoa', 'm_quiff', 'black', 'round', 'amber'), equipped: { top: 'm_shirt_white', outerwear: 'm_blazer_navy', bottom: 'm_chinos_navy', shoes: 'm_loafers_black', bracelet: 'm_watch_gold' } },
    vibes: { chic: 2, bold: 1, deep: 1, funny: 0, sweet: -1 },
    gifts: { love: ['perfume', 'tickets'], like: ['silk_scarf', 'roses', 'vinyl'], dislike: ['teddy'] },
    intro: 'Forgive me — I couldn\'t help noticing you have impeccable taste. In outfits, I mean. And in restaurants. Julian Ashford. Please, sit.',
    reactions: {
      great: ['Darling, that\'s a perfect line. Have you considered acting?', 'Exquisite answer.', 'You keep surprising me. I like that.'],
      ok: ['Hm, not bad.', 'Fair.', 'I see.'],
      bad: ['Oh. How… sweet.', 'Interesting choice.', 'Ah. Well.'],
    },
    topics: [
      { q: 'If your life were a film, what genre would it be?', choices: [
        { t: 'A glamorous Hollywood musical', v: 'chic', r: 'With costume changes in every scene. Naturally.' },
        { t: 'An adventure with a daring heroine', v: 'bold', r: 'I\'d buy a ticket. Front row.' },
        { t: 'A quiet indie film about finding yourself', v: 'deep', r: 'The best ones always are.' },
      ] },
      { q: 'Critics called my last role "stiff". Rude, but… maybe fair?', choices: [
        { t: 'Ignore them. Stay true to your craft', v: 'deep', r: 'You\'re right. The work is what matters.' },
        { t: 'Next role, be fearless — surprise everyone', v: 'bold', r: 'Fearless. I like that. Very much.' },
        { t: 'Aww, they\'re just jealous!', v: 'sweet', r: 'Ha, perhaps. Thank you.' },
      ] },
      { q: 'Be honest: is it too much to wear a cape to a premiere?', choices: [
        { t: 'Only if it\'s velvet and tailored perfectly', v: 'chic', r: 'Midnight velvet. I knew you\'d understand.' },
        { t: 'Wear it. Own it. Swish it dramatically', v: 'bold', r: 'The swish is the whole point!' },
        { t: 'You\'d look like a vampire', v: 'funny', r: '…I\'ll take that under advisement.' },
      ] },
    ],
    flirts: [
      { q: 'I\'m rehearsing a romantic scene tomorrow. Care to run lines with me?', choices: [
        { t: '"Only if I get top billing."', v: 'chic', r: 'You\'d steal the show. You already have.' },
        { t: '"Are we sure it\'s just rehearsal?"', v: 'bold', r: 'With you? I\'m not sure of anything.' },
        { t: '"I\'ll probably giggle the whole time."', v: 'funny', r: 'Then I\'ll have to work harder to make you swoon.' },
      ] },
      { q: 'Every leading man needs a muse, you know.', choices: [
        { t: '"Then consider me hired."', v: 'bold', r: 'The contract is binding, I\'m afraid.' },
        { t: '"Muses don\'t come cheap. I accept payment in dinners."', v: 'chic', r: 'La Rosette, Friday, eight o\'clock.' },
        { t: '"Aww, that\'s so cute!"', v: 'sweet', r: 'Cute. Right. I was going for devastating.' },
      ] },
    ],
    story: {
      2: { title: 'Off Script', text: 'Julian takes you to the empty film set after hours. He forgets his lines on purpose so you\'ll feed them to him, and you end up improvising a whole silly scene together.' },
      3: { title: 'Shelter Saturdays', text: 'You discover Julian\'s secret: every Saturday he walks dogs at the animal shelter, in his oldest jumper. "Tell no one," he begs, covered in mud and happier than you\'ve ever seen him.' },
      4: { title: 'Red Carpet Plus-One', text: '"I\'d like you on my arm at the premiere," Julian says, holding out an invitation embossed in gold. "Not for the cameras. For me."' },
      5: { title: 'The Final Scene', text: 'At the premiere, the film ends with the hero running through the rain to the one he loves. The lights come up, and Julian is already looking at you.' },
    },
    ask: { yes: 'Julian kisses your hand like an old film star. "Darling, I thought you\'d never ask. Yes — a thousand times yes."', no: '"I\'m flattered beyond words… but let\'s not rush our story. The best films build slowly."' },
    texts: {
      morning: ['Good morning, star. Breakfast at La Rosette? My treat.', 'Rehearsal at noon. Thinking of you between takes.'],
      miss: ['The corner table feels very empty tonight.', 'Watched our favourite film. You\'d have quoted every line.'],
      congrats: ['A triumph! Brava, darling 👏', 'The judges have impeccable taste. As do I.'],
      invite: ['Premiere screening on Saturday — be my plus-one?'],
    },
  },
  {
    id: 'elodie', kind: 'romance', name: 'Élodie Laurent', age: 24, job: 'Fashion designer', home: 'club', also: ['restaurant'],
    bio: 'Apprentice designer at Maison Étoile who sketches on everything — napkins, receipts, her own arm. Dreams of her own label; currently surviving on espresso and sequins.',
    look: { appearance: { skin: 'porcelain', hairStyle: 'bob', hairColor: 'auburn', eyes: 'cat', eyeColor: 'green', eyeliner: 'el_wing', lipstick: 'lip_red', eyeshadow: 'es_champagne', blush: 'bl_rose' }, equipped: { top: 'top_stripe_tee', bottom: 'bot_cream_wide', shoes: 'sh_red_flats', hairAcc: 'hacc_beret', earrings: 'ear_gold_hoops' } },
    vibes: { chic: 2, deep: 2, funny: 0, bold: 1, sweet: -1 },
    gifts: { love: ['sketchbook', 'silk_scarf'], like: ['perfume', 'candle', 'vinyl'], dislike: ['surf_wax'] },
    intro: 'Don\'t move! That silhouette… sorry. I\'m Élodie. I design clothes, and your outfit just gave me three new ideas. Can I sketch you? Is that strange?',
    reactions: {
      great: ['Oui! Exactly that.', 'You have such an eye. It\'s rare.', 'I could talk to you for hours.'],
      ok: ['Hm, peut-être.', 'Okay, I see it.', 'Fair.'],
      bad: ['Ah… non, not for me.', 'Hm. Bit obvious, no?', 'If you say so!'],
    },
    topics: [
      { q: 'What does style mean to you?', choices: [
        { t: 'Telling your story without saying a word', v: 'deep', r: 'Mon dieu. That\'s going on my studio wall.' },
        { t: 'Perfect tailoring and one bold accessory', v: 'chic', r: 'You sound like Madame Céleste. That\'s a compliment.' },
        { t: 'Whatever is comfiest', v: 'funny', r: 'Ha! Comfort can be couture too… sometimes.' },
      ] },
      { q: 'Madame Céleste rejected my collection today.', choices: [
        { t: 'Every great designer was rejected first', v: 'deep', r: 'You\'re right. Rejection is just a fitting before the final.' },
        { t: 'Launch it yourself and prove her wrong', v: 'bold', r: 'My own label… you believe I could?' },
        { t: 'Let\'s go eat cake about it', v: 'sweet', r: 'Cake does help. A little.' },
      ] },
      { q: 'If you could design one thing, what would it be?', choices: [
        { t: 'A gown that sparkles like the night sky', v: 'chic', r: 'I\'m already sketching it. Look!' },
        { t: 'A city where everyone feels beautiful', v: 'deep', r: 'That\'s… the most beautiful answer anyone has given.' },
        { t: 'Pyjamas you can wear to a gala', v: 'funny', r: 'Ha! Actually… that could be genius.' },
      ] },
    ],
    flirts: [
      { q: 'I need a muse for my new collection. Someone with… presence.', choices: [
        { t: '"Then you\'ve found her."', v: 'bold', r: 'I know. I knew the moment I saw you.' },
        { t: '"Only if I get first pick of the samples."', v: 'chic', r: 'Every single piece. Made to measure.' },
        { t: '"Me? Really?"', v: 'sweet', r: 'Really. Don\'t be so surprised.' },
      ] },
      { q: 'Hold still — I need your measurements. Strictly professional, of course.', choices: [
        { t: '"Of course. Strictly."', v: 'chic', r: 'Strictly. Mostly.' },
        { t: '"You\'re blushing, Élodie."', v: 'bold', r: 'I am NOT. …Okay, I am.' },
        { t: 'Giggle uncontrollably', v: 'funny', r: 'Stop it, you\'ll make me poke you with a pin!' },
      ] },
    ],
    story: {
      2: { title: 'The Sketchbook', text: 'Élodie lets you flip through her sketchbook. Page after page of gowns… and, near the back, small drawings of you. She snatches it back, scarlet. "Those are studies. For proportion."' },
      3: { title: 'Atelier at Midnight', text: 'Fabric everywhere, music low. Élodie pins a gown on you at midnight, mouth full of pins, and tells you the whole story of her grandmother\'s sewing machine.' },
      4: { title: 'The Collection', text: 'Élodie shows you her first finished collection. It\'s called "Étoile de la Ville" — star of the city. "Every piece," she says, "was designed with you in mind."' },
      5: { title: 'Runway Finale', text: 'At Élodie\'s debut show, the last look is a starlit gown — and you\'re wearing it. As you reach the end of the runway she steps out to take her bow, and takes your hand instead.' },
    },
    ask: { yes: 'Élodie drops her sketchbook. "Oui! Oui, oui, oui. Mon dieu, I have been designing our matching outfits for weeks."', no: '"You\'re wonderful… but give me a little more time? I fall slowly, then all at once."' },
    texts: {
      morning: ['Bonjour ✨ new sketch, guess who it\'s inspired by', 'Espresso #3. Thinking of you.'],
      miss: ['Pinned a gown today and thought of your silhouette 🪡', 'The atelier is too quiet without you.'],
      congrats: ['FÉLICITATIONS!! I\'m designing your trophy outfit 🏆', 'The judges finally have taste!'],
      invite: ['Gallery opening at the Social Club — come be fabulous with me?'],
    },
  },

  // ===================================================================== friends
  {
    id: 'mimi', kind: 'friend', name: 'Mimi Haru', age: 22, job: 'Beauty vlogger', home: 'cafe', also: ['club'],
    bio: 'Two million followers, one ring light and zero chill. Reviews every lipstick in Blush Studio and will absolutely make you a tutorial star.',
    look: { appearance: { skin: 'peach', hairStyle: 'twin_tails', hairColor: 'bubblegum', eyes: 'round', eyeColor: 'violet', eyeshadow: 'es_lilac', lipstick: 'lip_gloss', blush: 'bl_pink' }, equipped: { top: 'top_crop_gingham', bottom: 'bot_tennis_pleat', shoes: 'sh_lilac_sneaks', hairAcc: 'hacc_pink_bow', earrings: 'ear_silver_studs' } },
    vibes: { funny: 2, sweet: 2, chic: 1, deep: -1, bold: 0 },
    gifts: { love: ['perfume', 'teddy'], like: ['cupcakes', 'chocolates', 'candle'], dislike: ['sketchbook'] },
    intro: 'OMG hi!! Your lashes are EVERYTHING. I\'m Mimi — I do beauty videos? Wait, are you the girl from the Pavilion? Bestie, we need to be friends immediately.',
    reactions: { great: ['STOP I love that 😂', 'Bestie behaviour!!', 'Okay you\'re officially in my videos.'], ok: ['Haha cute', 'Okay okay!', 'Fair!'], bad: ['Oh… heavy.', 'Hmm, okay?', 'Bit serious, babe!'] },
    topics: [
      { q: 'Be honest, glitter liner: iconic or a crime?', choices: [
        { t: 'Iconic. More glitter. Always', v: 'funny', r: 'THANK YOU. I\'m filming that answer.' },
        { t: 'A tiny touch, elegantly placed', v: 'chic', r: 'Ooh, editorial. I see you.' },
        { t: 'Makeup is a mask we hide behind', v: 'deep', r: 'Oof… okay philosopher. Glitter though?' },
      ] },
      { q: 'A hater left a mean comment on my video 😢', choices: [
        { t: 'Sending you a virtual hug right now', v: 'sweet', r: 'Aww 🥺 you\'re literally the best.' },
        { t: 'Reply with a GIF of a sparkly unicorn', v: 'funny', r: 'HAHA doing it immediately.' },
        { t: 'Block, delete, live your best life', v: 'bold', r: 'Yeah! Boss move.' },
      ] },
    ],
    story: {
      2: { title: 'Collab!', text: 'Mimi films a "get ready with me" with you. You laugh so much you mess up the eyeliner three times. It becomes her most-watched video ever.' },
      3: { title: 'Sleepover', text: 'Face masks, popcorn and a terrible rom-com. Mimi falls asleep mid-sentence and you tuck a blanket over her. Best friends status: loading.' },
      4: { title: 'Bestie Bracelets', text: 'Mimi gives you a bracelet that matches hers. "Besties forever. Not up for negotiation."' },
    },
    texts: { morning: ['GM bestie ☀️ new lipstick drop today!!', 'Did you see my new video?? 💄'], miss: ['Where are youuu, come to the café 🥺'], congrats: ['MY BESTIE WON 🏆😭 posting it everywhere', 'Iconic. Legendary. You.'], invite: ['Sleepover at mine this weekend? Bring snacks!!'] },
    house: { property: 'chic_apartment', style: 'pastel_dream', wallpaper: 'wp_pastel_stripe', floor: 'fl_lilac_carpet' },
  },
  {
    id: 'zara', kind: 'friend', name: 'Zara Vale', age: 25, job: 'Runway model', home: 'club', also: ['restaurant'],
    bio: 'Walked for every house at Glamour Fashion Week. Cool as ice on the runway, a total goof backstage. Knows everyone, and will introduce you.',
    look: { appearance: { skin: 'ebony', hairStyle: 'curls', hairColor: 'black', eyes: 'cat', eyeColor: 'amber', eyeshadow: 'es_gold', eyeliner: 'el_dramatic', lipstick: 'lip_plum' }, equipped: { dress: 'dr_black_bodycon', outerwear: 'jk_leather', shoes: 'sh_black_kneeboots', earrings: 'ear_gold_hoops', necklace: 'neck_velvet_choker' } },
    vibes: { bold: 2, chic: 2, funny: 1, sweet: -1, deep: 0 },
    gifts: { love: ['silk_scarf', 'tickets'], like: ['perfume', 'vinyl', 'chocolates'], dislike: ['teddy'] },
    intro: 'You\'re the one everybody\'s talking about. Zara. Model, night owl, terrible dancer. Stick with me tonight — I\'ll introduce you to everyone worth knowing.',
    reactions: { great: ['Ha! Yes, girl.', 'Now THAT\'s attitude.', 'I like you more every minute.'], ok: ['Mm, fair.', 'Sure.', 'Cute.'], bad: ['Bit soft, babe.', 'Hm. Okay.', 'Not my vibe.'] },
    topics: [
      { q: 'Runway rule number one?', choices: [
        { t: 'Never, ever look at your feet', v: 'bold', r: 'Exactly. Chin up, world down.' },
        { t: 'Your walk is your signature — make it yours', v: 'chic', r: 'Spoken like a pro.' },
        { t: 'Hope you don\'t trip?', v: 'funny', r: 'Ha! Honestly, that IS rule one.' },
      ] },
      { q: 'I got offered a campaign in Milan, but it means missing my sister\'s birthday.', choices: [
        { t: 'Family first. Milan will call again', v: 'deep', r: '…Yeah. You\'re right. Thanks for saying it.' },
        { t: 'Take her to Milan with you!', v: 'bold', r: 'Wait. That\'s genius. Booking two tickets.' },
        { t: 'Bake her a cake from Milan?', v: 'funny', r: 'Ha — airmail cake. I love you.' },
      ] },
    ],
    story: {
      2: { title: 'Backstage Pass', text: 'Zara sneaks you backstage at Fashion Week. Chaos, hairspray, and Zara calmly eating noodles in full couture. "Welcome to the glamorous life," she grins.' },
      3: { title: 'Real Talk', text: 'At 2 a.m. on the Social Club roof, Zara admits she still gets nervous before every show. "Don\'t tell anyone," she says. You won\'t.' },
      4: { title: 'Front Row', text: 'At your next contest, Zara is in the front row with a giant sign: GO BESTIE. She is not subtle. You love her for it.' },
    },
    texts: { morning: ['Fitting at 10, brunch at 12. You in?', 'Who are you wearing today? 👀'], miss: ['Rooftop is boring without you'], congrats: ['Told everyone you\'d win. Called it 💅', 'That walk?? Iconic.'], invite: ['Party at mine Saturday. Dress code: unforgettable.'] },
    house: { property: 'luxury_loft', style: 'hollywood_luxury', wallpaper: 'wp_charcoal_paint', floor: 'fl_black_marble' },
  },
  {
    id: 'priya', kind: 'friend', name: 'Priya Belle', age: 23, job: 'Film student & director', home: 'park', also: ['cafe'],
    bio: 'Shoots short films on a borrowed camera and quotes directors you\'ve never heard of. Wants to cast you in everything. Owns forty notebooks.',
    look: { appearance: { skin: 'caramel', hairStyle: 'side_braid', hairColor: 'dark_brown', eyes: 'almond', eyeColor: 'brown', lipstick: 'lip_nude' }, equipped: { top: 'top_plaid_sweater', bottom: 'bot_black_jeans', shoes: 'sh_tan_boots', bag: 'bag_canvas_tote', earrings: 'ear_pearl' } },
    vibes: { deep: 2, funny: 1, bold: 1, chic: -1, sweet: 0 },
    gifts: { love: ['sketchbook', 'film_roll'], like: ['vinyl', 'candle', 'cookbook'], dislike: ['perfume'] },
    intro: 'Sorry, you\'re in my shot — no wait, stay! You\'re perfect. I\'m Priya. I\'m making a film about this lake. Want to be in it? There\'s no budget. At all.',
    reactions: { great: ['That\'s so interesting. Tell me more!', 'You think like a director.', 'Okay you\'re definitely in my film.'], ok: ['Hm, nice.', 'Fair enough.', 'Sure!'], bad: ['Hm… bit surface-level.', 'Okay…', 'Not sure about that.'] },
    topics: [
      { q: 'What\'s a film that changed your life?', choices: [
        { t: 'One that made me cry for a week', v: 'deep', r: 'The best ones break your heart a little.' },
        { t: 'Anything with a dance number', v: 'funny', r: 'Ha! Musicals are underrated, honestly.' },
        { t: 'Whatever has the best costumes', v: 'chic', r: 'You\'d get on with my costume designer. Which is me.' },
      ] },
      { q: 'My film got rejected from the festival.', choices: [
        { t: 'Make the next one even braver', v: 'bold', r: 'Braver. Yes. I have an idea already.' },
        { t: 'Rejection means you\'re trying. That\'s what counts', v: 'deep', r: 'Thanks. I needed to hear that.' },
        { t: 'Host your own festival in the park!', v: 'funny', r: 'Wait… the Heart Lake Film Fest? I\'m doing it.' },
      ] },
    ],
    story: {
      2: { title: 'Lights, Camera, Lake', text: 'You spend a whole afternoon filming Priya\'s short film by the lake. You play "mysterious woman with umbrella". It takes 47 takes. It\'s the most fun you\'ve had in ages.' },
      3: { title: 'Premiere in the Park', text: 'Priya projects her film onto a bedsheet at Heart Lake. Fifty people come. When your scene plays, she squeezes your hand so hard it hurts.' },
      4: { title: 'Credits', text: 'Priya\'s film gets into the festival. In the credits, under "Special Thanks", there is only one name: yours.' },
    },
    texts: { morning: ['Golden hour at the lake later — wanna shoot?', 'Found a new director to obsess over 📽️'], miss: ['Writing a character based on you. Is that weird'], congrats: ['This is a movie moment. Directing the montage now 🎬'], invite: ['Movie night at mine, I have 4 notebooks of recommendations'] },
    house: { property: 'townhouse', style: 'dark_academia', wallpaper: 'wp_forest_paint', floor: 'fl_herringbone' },
  },
  {
    id: 'lottie', kind: 'friend', name: 'Lottie Pearl', age: 24, job: 'Florist', home: 'cafe', also: ['park'],
    bio: 'Runs the flower cart outside Sugarplum Café. Knows the meaning of every flower and will absolutely give you peonies "just because".',
    look: { appearance: { skin: 'honey', hairStyle: 'long_waves', hairColor: 'strawberry', eyes: 'doe', eyeColor: 'blue', blush: 'bl_peach', lipstick: 'lip_coral' }, equipped: { dress: 'dr_tea_floral', shoes: 'sh_white_sandals', hairAcc: 'hacc_daisy_clip', bag: 'bag_straw_tote' } },
    vibes: { sweet: 2, deep: 1, funny: 1, bold: -1, chic: 0 },
    gifts: { love: ['succulent', 'cupcakes'], like: ['roses', 'candle', 'cookbook'], dislike: ['tickets'] },
    intro: 'Oh! Hello! You look like you need a flower. Here — a daisy. It means new beginnings. I\'m Lottie. I run the little flower cart. We\'re going to be friends, I can tell.',
    reactions: { great: ['Oh, that\'s lovely!', 'You have such a kind heart.', 'Aww. You\'re a sunflower, you know that?'], ok: ['Oh, okay!', 'Sweet.', 'Fair!'], bad: ['Oh… gosh.', 'That\'s a bit much for me!', 'Hm, okay!'] },
    topics: [
      { q: 'If you were a flower, which would you be?', choices: [
        { t: 'A sunflower — always facing the light', v: 'sweet', r: 'Oh, that suits you perfectly.' },
        { t: 'A wild orchid — rare and mysterious', v: 'deep', r: 'Ooh. Orchids are survivors, you know.' },
        { t: 'A cactus. Don\'t touch', v: 'funny', r: 'Haha! A cactus with a flower on top, maybe.' },
      ] },
      { q: 'I\'m saving up to open a real flower shop.', choices: [
        { t: 'It\'ll be the prettiest shop in the city', v: 'sweet', r: 'You\'ll be my very first customer!' },
        { t: 'Let\'s plan it — what\'s your dream shop like?', v: 'deep', r: 'Oh! Fairy lights, a cat, a little café corner…' },
        { t: 'Sell me a rose for a million coins', v: 'funny', r: 'Ha! Sold. Payment plans available.' },
      ] },
    ],
    story: {
      2: { title: 'Flower Language', text: 'Lottie teaches you what every flower means. Roses for love, daisies for innocence, peonies for happiness. She makes you a tiny bouquet of all three.' },
      3: { title: 'Rainy Day', text: 'A storm knocks over Lottie\'s cart. You spend an hour in the rain rescuing petals together, laughing until your sides hurt.' },
      4: { title: 'Grand Opening', text: 'Lottie finally opens her shop. Above the door, a hand-painted sign: "Pearl & Petal — with thanks to my best friend."' },
    },
    texts: { morning: ['Fresh peonies today! Saved you some 🌸', 'Good morning sunflower 🌻'], miss: ['The cart is lonely without you 🥺'], congrats: ['A trophy!! Making you a victory bouquet 💐'], invite: ['Tea and cake at mine? I baked!'] },
    house: { property: 'cosy_studio', style: 'romantic_cottage', wallpaper: 'wp_floral', floor: 'fl_oak' },
  },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

/** Shared small-talk topics (reactions come from each character's own voice). */
export const SMALL_TALK = [
  { q: 'What did you get up to today?', choices: [
    { t: 'Worked hard and treated myself after', v: 'chic' }, { t: 'Got lost in the city — on purpose', v: 'bold' }, { t: 'Tripped in front of a whole café. Nailed it', v: 'funny' },
  ] },
  { q: 'What\'s the best thing about Glamour City?', choices: [
    { t: 'The people — like you', v: 'sweet' }, { t: 'Every street feels like a new story', v: 'deep' }, { t: 'The shoe shops, obviously', v: 'chic' },
  ] },
  { q: 'Coffee or tea?', choices: [
    { t: 'Tea, in a pretty cup', v: 'sweet' }, { t: 'Triple espresso, no regrets', v: 'bold' }, { t: 'Hot chocolate. I\'m a child', v: 'funny' },
  ] },
  { q: 'What are you dreaming about lately?', choices: [
    { t: 'Becoming truly famous', v: 'bold' }, { t: 'Finding where I really belong', v: 'deep' }, { t: 'A walk-in wardrobe with its own chandelier', v: 'chic' },
  ] },
];
