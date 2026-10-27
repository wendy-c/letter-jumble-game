import { fn } from "storybook/test";
import LetterBank from "./LetterBank";

export default {
  title: "Components/Spelling/LetterBank",
  component: LetterBank,
  args: { label: "Scrambled letters", round: 0, tiles: ["t", "k", "e", "i", "n", "t"], placed: [], onTileClick: fn() },
};

export const AllAvailable = {};
export const SomePlaced = { args: { placed: [1, 3] } };
export const VowelChoices = { args: { label: "Letter choices", tiles: ["a", "e", "i", "o", "u"] } };
export const DigraphChoices = { args: { label: "Digraph choices", tiles: ["sh", "ch", "th", "ph"] } };
