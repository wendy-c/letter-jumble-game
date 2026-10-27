import { fn } from "storybook/test";
import Tutorial from "./Tutorial";

// The new family's tour. Its later steps point at parts of the front page, so see them in
// Pages › Tour For A New Family.
export default {
  title: "Components/Players/Tutorial",
  component: Tutorial,
  args: { step: 0, language: "en", onLanguage: fn(), onStep: fn(), onDone: fn() },
};

export const LanguageQuestion = {};
export const StepWithNothingToPointAt = { args: { step: 2 } };
