import { fn } from "storybook/test";
import { mathLevels } from "../math-data/math-data";
import Breadcrumbs from "./Breadcrumbs";
import LevelMap from "./LevelMap";

const levels = mathLevels.filter((level) => level.ages.includes("k1"));
const breadcrumbs = <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "K1 Challenge", href: "/math-logic" }]} />;
// Levels 1-6 finished (Level 3 with every answer right), Level 7 open.
const scores = { 0: [8, 10], 1: [9, 10], 2: [10, 10], 3: [6, 10], 4: [7, 10], 5: [9, 10] };

export default {
  title: "Components/Math/LevelMap",
  component: LevelMap,
  args: {
    title: "K1 Challenge", focus: "Numbers under 10", levels, breadcrumbs, mapKey: "storybook-map", onSelectLevel: fn(),
    lockFor: (level) => (levels.indexOf(level) <= 6 ? "open" : "locked"),
    scoreFor: (level) => scores[levels.indexOf(level)] ?? null,
  },
  parameters: { layout: "fullscreen" },
};

export const PartWay = {};
export const JustStarting = { args: { lockFor: (level) => (levels.indexOf(level) === 0 ? "open" : "locked"), scoreFor: () => null } };
export const AllDone = { args: { lockFor: () => "open", scoreFor: () => [10, 10] } };
