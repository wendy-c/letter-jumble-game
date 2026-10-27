import { fn } from "storybook/test";
import { games } from "../games-data";
import GameCard from "./GameCard";

const game = (id) => games.find((candidate) => candidate.id === id);

// A front-page game card: tap the speaker to hear what the game is.
export default {
  title: "Components/Menus/GameCard",
  component: GameCard,
  args: { onSelect: fn() },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

export const WithLetters = { args: { game: game("cvc"), note: game("cvc").note } };
export const Picture = { args: { game: game("letter-jumble"), note: game("letter-jumble").note } };
export const Chinese = { args: { game: game("measure-words"), note: game("measure-words").note } };
export const Mochi = { args: { game: game("dragon"), note: game("dragon").note } };
