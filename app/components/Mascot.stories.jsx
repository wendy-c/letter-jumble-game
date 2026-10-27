import Mascot from "./Mascot";

export default {
  title: "Components/Mochi/Mascot",
  component: Mascot,
  argTypes: { mood: { control: "inline-radio", options: ["happy", "confused", "idea"] } },
  decorators: [(Story) => <div style={{ width: 160 }}><Story /></div>],
};

export const Happy = { args: { mood: "happy" } };
export const Confused = { args: { mood: "confused" } };
export const Idea = { args: { mood: "idea" } };
