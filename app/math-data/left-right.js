// Left-or-right questions for K2's and K3's Challenge levels, each a picture to think about:
// Ada walking away with her cat and dog (seen from behind, her left is on our left), Elly looking
// in a mirror with a mole on one cheek (she faces away, so her right is on our right, in the
// mirror too), and Tofu facing us with one arm up (her left arm is on our right). Each has a picture
// for either side, drawn by scripts/draw-words.py and scripts/make-mochi.py.
const art = "/images/game-asset/math";
const say = (en, zh) => ({ en, zh });

const scenes = {
  walk: {
    picture: (side) => `${art}/lr-walk-cat-${side}.svg`,
    prompt: say("Ada is walking with her cat and her dog. Is the cat on Ada’s left or on her right?", "Ada 和她的貓、狗一起散步。貓在 Ada 的左邊還是右邊？"),
    title: "Ada’s cat: left or right?",
    sides: { left: say("Left", "左邊"), right: say("Right", "右邊") },
  },
  mirror: {
    picture: (side) => `${art}/lr-mirror-mole-${side}.svg`,
    prompt: say("Elly is looking in the mirror. Is the mole on Elly’s left cheek or on her right cheek?", "Elly 正在照鏡子。Elly 的痣在左邊面頰還是右邊面頰？"),
    title: "Elly’s mole: left or right?",
    sides: { left: say("Left cheek", "左邊面頰"), right: say("Right cheek", "右邊面頰") },
  },
  tofu: {
    picture: (side) => `${art}/lr-tofu-${side}-arm.svg`,
    prompt: say("Tofu is facing you. Is Tofu raising her left arm or her right arm?", "Tofu 面向着你。Tofu 舉起的是左手還是右手？"),
    title: "Tofu’s arm: left or right?",
    sides: { left: say("Left arm", "左手"), right: say("Right arm", "右手") },
  },
};

export const leftRightScenes = Object.keys(scenes);

// One question: the scene `kind` ("walk", "mirror" or "tofu"), with its answer side picked by
// `random`.
export function leftRight(random, kind) {
  const scene = scenes[kind];
  const side = random() < 0.5 ? "left" : "right";
  return {
    prompt: scene.prompt,
    picture: scene.picture(side),
    scene: null,
    visual: null,
    answer: side,
    answers: [scene.title],
    options: ["left", "right"].map((label) => ({ label, name: scene.sides[label], correct: label === side })),
  };
}
