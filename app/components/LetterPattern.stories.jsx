import LetterPattern from "./LetterPattern";

export default {
  title: "Components/Menus/LetterPattern",
  component: LetterPattern,
};

export const BeginningSound = { args: { letters: [null, "a", "t"] } };
export const MiddleSound = { args: { letters: ["c", null, "t"] } };
export const Digraph = { args: { letters: ["s", "h", null] } };
