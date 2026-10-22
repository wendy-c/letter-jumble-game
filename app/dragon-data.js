export const dragonName = "Mochi";

// Everything Mochi can be given. `duration` is how long the animation runs, in seconds;
// buttons stay disabled until it finishes.
export const dragonActions = [
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

// Free things Mochi does when she's tapped, taking turns.
export const petActions = [
  { id: "pet", kind: "pet", label: "Snuggle", cost: 0, duration: 2.2, reaction: "Snuggles! I love you!" },
  { id: "twirl", kind: "pet", label: "Twirl", cost: 0, duration: 2.2, reaction: "Wheee! Watch me twirl!" },
  { id: "wave", kind: "pet", label: "Wave", cost: 0, duration: 2.2, reaction: "Hi hi! 👋" },
];

export const petAction = petActions[0];

export const dragonActionsById = Object.fromEntries([...dragonActions, ...petActions].map((action) => [action.id, action]));
