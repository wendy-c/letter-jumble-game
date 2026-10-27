import { fn } from "storybook/test";
import { games } from "../games-data";
import HowToPlayDialog, { AboutButton, AboutDialog, HowToPlayButton, howToLanguage } from "./HowToPlayDialog";

const game = (id) => games.find((candidate) => candidate.id === id);

export default {
  title: "Components/Cards/HowToPlayDialog",
  component: HowToPlayDialog,
  args: { onClose: fn() },
};

export const CvcBeginningSound = { args: { game: game("cvc"), topicId: "beginning-sound", language: "en" } };
export const CvcMiddleSound = { args: { game: game("cvc"), topicId: "middle-sound", language: "en" } };
export const LetterJumble = { args: { game: game("letter-jumble"), language: "en" } };
export const ChineseGame = { args: { game: game("chinese"), language: howToLanguage("chinese", "en") } };
export const Dragon = { args: { game: game("dragon"), language: "en" } };
export const DragonInChinese = { args: { game: game("dragon"), language: "zh" } };

export const About = { render: () => <AboutDialog game={game("cvc")} onClose={fn()} /> };
export const Buttons = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <HowToPlayButton language="en" onClick={fn()} />
      <AboutButton onClick={fn()} />
    </div>
  ),
};
