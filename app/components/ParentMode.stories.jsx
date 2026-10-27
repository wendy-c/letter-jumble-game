import { expect, fn, userEvent, within } from "storybook/test";
import Breadcrumbs from "./Breadcrumbs";
import ParentMode from "./ParentMode";

const players = [{ name: "Ada", coins: 37, age: "3-4" }, { name: "Elly", coins: 120, age: "5-6", gameSettings: { idioms: false } }];

export default {
  title: "Components/Players/ParentMode",
  component: ParentMode,
  args: {
    players,
    breadcrumbs: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Parent mode", href: "/parent" }]} />,
    onSetGameEnabled: fn(), onDone: fn(),
  },
};

export const GrownUpQuestion = {};

// Answers the grown-up maths question, the way a parent would.
async function answerGrownUpQuestion(canvasElement) {
  const canvas = within(canvasElement);
  const [first, second] = canvasElement.querySelector(".grown-up-question strong").textContent.split(" × ").map(Number);
  await userEvent.type(canvas.getByRole("textbox"), String(first * second));
  await userEvent.click(canvas.getByRole("button", { name: /Continue|繼續/ }));
  return canvas;
}

// Each child's games, after the maths question.
export const Unlocked = {
  play: async ({ canvasElement }) => {
    const canvas = await answerGrownUpQuestion(canvasElement);
    await expect((await canvas.findAllByRole("switch")).length).toBeGreaterThan(0);
  },
};

export const NoChildren = {
  args: { players: [] },
  play: async ({ canvasElement }) => {
    await answerGrownUpQuestion(canvasElement);
  },
};
