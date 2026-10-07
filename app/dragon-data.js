export const dragonName = "Mochi";

// Everything Mochi can be given. `duration` is how long the animation runs, in seconds;
// buttons stay disabled until it finishes.
export const dragonActions = [
  { id: "apple", kind: "treat", label: "Apple", icon: "🍎", cost: 1, duration: 3.2, reaction: "Wheee! Spinny apple!" },
  { id: "carrot", kind: "treat", label: "Carrot sticks", icon: "🥕", cost: 1, duration: 4.2, reaction: "Crunchy! Happy dance time!" },
  { id: "cupcake", kind: "treat", label: "Rainbow cupcake", icon: "🧁", cost: 2, duration: 3.8, reaction: "Hee hee hee! It tickles!" },
  { id: "chilli", kind: "treat", label: "Chilli pepper", icon: "🌶️", cost: 3, duration: 4.4, reaction: "So spicy… RAWR! 🔥" },
  { id: "icecream", kind: "treat", label: "Ice cream", icon: "🍦", cost: 2, duration: 4.2, reaction: "Yummy… but b-b-brrr! 🥶" },
  { id: "milkshake", kind: "treat", label: "Milkshake", icon: "🍓", cost: 2, duration: 4.8, reaction: "Slurp! So sweet I’m floating! 💕" },
  { id: "comb", kind: "groom", label: "Comb", icon: "🪮", cost: 1, duration: 4.0, reaction: "Ooh, so fluffy and soft!" },
  { id: "bath", kind: "groom", label: "Bath", icon: "🛁", cost: 3, duration: 6.4, reaction: "Bubbles! …and a cosy towel." },
  { id: "painting", kind: "activity", label: "Painting", icon: "🎨", cost: 2, duration: 6.8, reaction: "Look! I painted a rainbow! 🌈" },
  { id: "ballet", kind: "activity", label: "Ballet dancing", icon: "🩰", cost: 2, duration: 6.2, reaction: "Twirl, twirl, curtsy! ✨" },
];

export const petAction = { id: "pet", kind: "pet", label: "Snuggle", cost: 0, duration: 2.2, reaction: "Snuggles! I love you!" };

export const dragonActionsById = Object.fromEntries([...dragonActions, petAction].map((action) => [action.id, action]));
