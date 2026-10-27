import { categories } from "../game-data";
import PictureClue from "./PictureClue";

const animals = categories.find((topic) => topic.id === "animals");
const body = categories.find((topic) => topic.id === "body-and-face");

export default {
  title: "Components/Spelling/PictureClue",
  component: PictureClue,
  decorators: [(Story) => <div className="game-card" style={{ maxWidth: 520 }}><Story /></div>],
};

export const Emoji = { args: { topic: animals, puzzle: animals.words[1], round: 1 } };
export const Drawing = { args: { topic: body, puzzle: body.words[0], round: 0 } };
