import { QuestionsByType, TypeOverview } from "./QuestionsByType";

// Every Daily Challenge question sorted by type, to review one type at a time. Each page can show
// any of the classes (K1, K2, K3) and either language, from the controls.
export default {
  title: "Challenge/Daily Challenge/By type",
  component: QuestionsByType,
  args: { classes: ["k1", "k2", "k3"], language: "en" },
  argTypes: {
    classes: { control: "inline-check", options: ["k1", "k2", "k3"], labels: { k1: "K1", k2: "K2", k3: "K3" } },
    language: { control: "inline-radio", options: ["en", "zh"], labels: { en: "English", zh: "中文" } },
    type: { table: { disable: true } },
  },
  parameters: { layout: "padded" },
};

export const Overview = { render: () => <TypeOverview />, parameters: { controls: { disable: true } } };
export const Counting = { name: "Counting", args: { type: "counting" } };
export const NumberBonds = { name: "Number bonds", args: { type: "bonds" } };
export const TenFrames = { name: "Ten frames and making 10", args: { type: "frames" } };
export const NumberPad = { name: "Sums on the number pad", args: { type: "pad" } };
export const MissingNumber = { name: "Missing number in a sum", args: { type: "missing" } };
export const Adding = { name: "Adding", args: { type: "adding" } };
export const TakingAway = { name: "Taking away", args: { type: "taking" } };
export const Swaps = { name: "Swaps", args: { type: "swaps" } };
export const NumberRuns = { name: "Number runs", args: { type: "runs" } };
export const PuttingInOrder = { name: "Putting numbers in order", args: { type: "order" } };
export const PicturePatterns = { name: "Picture patterns", args: { type: "patterns" } };
export const TurningGrids = { name: "Turning grids", args: { type: "grids" } };
export const ShadingPuzzles = { name: "Shading puzzles", args: { type: "shading" } };
export const DifferentGroup = { name: "The different group", args: { type: "different" } };
export const RowWithTheMost = { name: "The row with the most", args: { type: "rows" } };
export const LegsAndWheels = { name: "Legs and wheels", args: { type: "legs" } };
export const StoryProblems = { name: "Story problems", args: { type: "stories" } };
export const Money = { name: "Money", args: { type: "money" } };
export const DaysOfTheWeek = { name: "Days of the week", args: { type: "days" } };
export const TellingTheTime = { name: "Telling the time", args: { type: "clock" } };
