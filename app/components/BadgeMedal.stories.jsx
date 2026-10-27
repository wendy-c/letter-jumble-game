import { badgeImage } from "../badges";
import BadgeMedal from "./BadgeMedal";

export default {
  title: "Components/Badges/BadgeMedal",
  component: BadgeMedal,
  args: { image: badgeImage("cvc", "beginning-sound"), earned: true },
  decorators: [(Story) => <div style={{ width: 140 }}><Story /></div>],
};

export const Earned = {};
export const NotYetEarned = { args: { earned: false } };
