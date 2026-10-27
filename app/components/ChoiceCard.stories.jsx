import { fn } from "storybook/test";
import ChoiceCard from "./ChoiceCard";
import LetterPattern from "./LetterPattern";

export default {
  title: "Components/Menus/ChoiceCard",
  component: ChoiceCard,
  args: { color: "lilac", number: 1, name: "Beginning Sound", note: "12 words to learn", icon: <LetterPattern letters={[null, "a", "t"]} />, onClick: fn() },
  argTypes: { color: { control: "select", options: ["peach", "lilac", "pink", "blue", "yellow", "green"] } },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

export const Topic = {};
export const WithPicture = { args: { color: "peach", name: "Animals", note: "13 words", icon: <img src="/images/icons/animals.svg" alt="" width="40" height="40" /> } };
