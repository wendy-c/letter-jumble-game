// The dragons of Rainbow Village. Each has a den with Treats, Grooming and Activities tabs, each
// tab in its own room (drawn by scripts/make-rooms.py).
//
// An action's `duration` is how long its animation runs, in seconds; buttons stay disabled until
// it finishes. `animation` names the scene animation when it isn't the action's id (so Tofu can
// reuse Mochi's bath), and `model` names the treat to show.

const mochiActions = [
  { id: "apple", kind: "treat", label: "Apple", icon: "🍎", cost: 1, duration: 3.2, reaction: "Wheee! Spinny apple!" },
  { id: "carrot", kind: "treat", label: "Carrot", icon: "🥕", cost: 1, duration: 4.2, reaction: "Crunchy! Happy dance time!" },
  { id: "cupcake", kind: "treat", label: "Cupcake", icon: "🧁", cost: 2, duration: 3.8, reaction: "Hee hee hee! It tickles!" },
  { id: "chilli", kind: "treat", label: "Chilli pepper", icon: "🌶️", cost: 3, duration: 4.4, reaction: "So spicy… RAWR! 🔥" },
  { id: "icecream", kind: "treat", label: "Ice cream", icon: "🍦", cost: 2, duration: 4.2, reaction: "Yummy… but b-b-brrr! 🥶" },
  { id: "milkshake", kind: "treat", label: "Milkshake", icon: "🍓", cost: 2, duration: 4.8, reaction: "Slurp! So sweet I’m floating! 💕" },
  { id: "lemon", kind: "treat", label: "Lemon", icon: "🍋", cost: 1, duration: 3.8, reaction: "Ooh! S-s-sour! 🍋😖" },
  { id: "salad", kind: "treat", label: "Salad", icon: "🥗", cost: 2, duration: 4.4, reaction: "Crunch! I feel super strong and healthy! 💪" },
  { id: "noodles", kind: "treat", label: "Noodles", icon: "🍜", cost: 2, duration: 5.2, reaction: "Slurrrp! Warm and cosy noodles… 🥰" },
  { id: "comb", kind: "groom", label: "Comb", icon: "🪮", cost: 1, duration: 4.0, reaction: "Ooh, so fluffy and soft!" },
  { id: "bath", kind: "groom", label: "Bath", icon: "🛁", cost: 3, duration: 6.4, reaction: "Bubbles! …and a cosy towel." },
  { id: "teeth", kind: "groom", label: "Brush teeth", icon: "🪥", cost: 1, duration: 5.0, reaction: "Brush, brush… sparkly clean teeth! ✨" },
  { id: "painting", kind: "activity", label: "Painting", icon: "🎨", cost: 2, duration: 6.8, reaction: "Look! I painted a rainbow! 🌈" },
  { id: "ballet", kind: "activity", label: "Ballet dancing", icon: "🩰", cost: 2, duration: 6.2, reaction: "Twirl, twirl, curtsy! ✨" },
  { id: "meditation", kind: "activity", label: "Meditation", icon: "🧘", cost: 2, duration: 6.4, reaction: "Breathe in… breathe out… so calm. 🌸" },
  { id: "friend", kind: "activity", label: "Invite a friend", icon: "💌", cost: 3, duration: 9.0, reaction: "Yay, Tofu’s here! Best friends dance time! 💛" },
  { id: "sandcastle", kind: "activity", label: "Sandcastle", icon: "🏰", cost: 2, duration: 6.6, reaction: "Ta-da! A sandcastle fit for a dragon! 🏖️" },
];

// Tofu is friendly but timid: she nibbles her treats shyly and loves books and science.
const tofuActions = [
  { id: "tofu-apple", animation: "shyApple", model: "apple", kind: "treat", label: "Apple", icon: "🍎", cost: 1, duration: 3.6, reaction: "Nibble, nibble… th-thank you! 🍎" },
  { id: "tofu-cupcake", animation: "shyCupcake", model: "cupcake", kind: "treat", label: "Cupcake", icon: "🧁", cost: 2, duration: 3.8, reaction: "Ooh… sprinkles! My favourite! ✨" },
  { id: "tofu-chilli", animation: "shyChilli", model: "chilli", kind: "treat", label: "Chilli pepper", icon: "🌶️", cost: 3, duration: 4.6, reaction: "Eep! Too hot, too hot! 💦" },
  { id: "tofu-icecream", animation: "shyIcecream", model: "icecream", kind: "treat", label: "Ice cream", icon: "🍦", cost: 2, duration: 4.4, reaction: "So c-cold… *hides in wings* 🥶" },
  { id: "tofu-lemon", animation: "shyLemon", model: "lemon", kind: "treat", label: "Lemon", icon: "🍋", cost: 1, duration: 3.8, reaction: "S-sour! …hee hee, that was funny. 🍋" },
  { id: "tofu-milkshake", animation: "shyMilkshake", model: "milkshake", kind: "treat", label: "Milkshake", icon: "🍓", cost: 2, duration: 4.8, reaction: "Sip… so sweet, I feel all floaty… 💕" },
  { id: "tofu-comb", animation: "comb", kind: "groom", label: "Comb", icon: "🪮", cost: 1, duration: 4.0, reaction: "Oh! That’s… really nice, actually. 😊" },
  { id: "tofu-bath", animation: "bath", kind: "groom", label: "Bath", icon: "🛁", cost: 3, duration: 6.4, reaction: "Is the water warm? …Ooh, bubbles! 🫧" },
  { id: "tofu-teeth", animation: "teeth", kind: "groom", label: "Brush teeth", icon: "🪥", cost: 1, duration: 5.0, reaction: "Brush, brush… like the book says! ✨" },
  { id: "tofu-baking", animation: "baking", kind: "activity", label: "Banana cupcakes", icon: "🍌", cost: 2, duration: 7.2, reaction: "Whisk, whisk… ding! Banana cupcakes! 🧁" },
  { id: "tofu-science", animation: "science", kind: "activity", label: "Science", icon: "🧪", cost: 2, duration: 7.4, reaction: "What happens if… POOF! Eureka! 🌈" },
  { id: "tofu-singing", animation: "singing", kind: "activity", label: "Singing", icon: "🎵", cost: 2, duration: 6.6, reaction: "La la la… *blushes* did you hear me? 🎶" },
  { id: "tofu-reading", animation: "reading", kind: "activity", label: "Reading", icon: "📚", cost: 2, duration: 7.4, reaction: "Once upon a time… ooh, what happens next? 📖" },
];

// The park, once it's unlocked: Mochi and Tofu play together.
const parkActions = [
  { id: "park-picnic", animation: "picnic", kind: "activity", label: "Have a picnic", icon: "🧺", cost: 2, duration: 7.4, reaction: "Cupcakes for two! Sharing is the best. 🧺" },
  { id: "park-hide", animation: "hideSeek", kind: "activity", label: "Hide and seek", icon: "🙈", cost: 2, duration: 8.2, reaction: "1, 2, 3… ready or not… found you, Mochi! 🙈" },
  { id: "park-bubbles", animation: "parkBubbles", kind: "activity", label: "Blow bubbles", icon: "🫧", cost: 2, duration: 6.8, reaction: "Pop, pop, pop! Catch the bubbles! 🫧" },
  { id: "park-scooters", animation: "scooters", kind: "activity", label: "Ride scooters", icon: "🛴", cost: 2, duration: 7.2, reaction: "Wheee! Race you round the park! 🛴" },
];

export const dragons = {
  mochi: {
    id: "mochi",
    name: "Mochi",
    title: "Mochi the Rainbow Dragon",
    house: "Mochi’s House",
    eyebrow: "MEET YOUR MAGIC PET",
    note: "Spend rainbow coins on yummy treats and pampering.",
    idleMessage: "Tap Mochi for a snuggle!",
    footer: "DRAG TO TURN · TAP TO SNUGGLE",
    // Treats at home, grooming in the bathroom, activities at the beach.
    rooms: { treat: "home", groom: "bathroom", activity: "beach" },
    actions: mochiActions,
    // Free things she does when tapped, taking turns.
    petActions: [
      { id: "pet", kind: "pet", label: "Snuggle", cost: 0, duration: 2.2, reaction: "Snuggles! I love you!" },
      { id: "twirl", kind: "pet", label: "Twirl", cost: 0, duration: 2.2, reaction: "Wheee! Watch me twirl!" },
      { id: "wave", kind: "pet", label: "Wave", cost: 0, duration: 2.2, reaction: "Hi hi! 👋" },
    ],
  },
  tofu: {
    id: "tofu",
    name: "Tofu",
    title: "Tofu the Fairy Dragon",
    house: "Tofu’s House",
    eyebrow: "MEET MOCHI’S BEST FRIEND",
    note: "Tofu is a little shy. She loves books, science and baking.",
    idleMessage: "H-hello… tap me gently?",
    footer: "DRAG TO TURN · TAP TO SAY HELLO",
    // Spent once to move Tofu into Rainbow Village.
    unlockCost: 100,
    // Treats in her cosy reading nook, grooming in her bathroom, activities in her kitchen.
    rooms: { treat: "tofu-home", groom: "tofu-bathroom", activity: "kitchen" },
    actions: tofuActions,
    petActions: [
      { id: "tofu-shy", animation: "tofuShy", kind: "pet", label: "Peekaboo", cost: 0, duration: 2.2, reaction: "Eep! …oh, it’s you. Hi! 🙈" },
      { id: "tofu-flutter", animation: "tofuFlutter", kind: "pet", label: "Flutter", cost: 0, duration: 2.4, reaction: "Flutter, flutter… look, I can float! 🧚" },
      { id: "tofu-giggle", animation: "tofuGiggle", kind: "pet", label: "Giggle", cost: 0, duration: 2.2, reaction: "Hee hee… that tickles! 😊" },
    ],
  },
  park: {
    id: "park",
    name: "Mochi and Tofu",
    title: "The Rainbow Park",
    heading: ["The Rainbow", "Park"],
    house: "The Park",
    eyebrow: "PLAY TOGETHER",
    note: "Mochi and Tofu love playing together in the park.",
    idleMessage: "Tap Mochi or Tofu to say hi!",
    footer: "DRAG TO TURN · TAP TO SAY HI",
    // Spent once, after Tofu has moved in, to open the park.
    unlockCost: 100,
    // Only activities here, all in the park.
    sections: ["activity"],
    rooms: { activity: "park" },
    actions: parkActions,
    petActions: [
      { id: "park-hello", animation: "parkHello", kind: "pet", label: "Hello", cost: 0, duration: 2.2, reaction: "Hi hi! We’re playing in the park! 👋" },
      { id: "park-hug", animation: "parkHug", kind: "pet", label: "Hug", cost: 0, duration: 2.4, reaction: "Best friends hug! 💛" },
    ],
  },
};

export const dragonActionsById = Object.fromEntries(
  Object.values(dragons).flatMap((dragon) => [...dragon.actions, ...dragon.petActions]).map((action) => [action.id, action]),
);
