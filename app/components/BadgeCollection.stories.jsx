import BadgeCollection from "./BadgeCollection";
import Breadcrumbs from "./Breadcrumbs";

const breadcrumbs = <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My badges", href: "/badges" }]} />;

export default {
  title: "Components/Badges/BadgeCollection",
  component: BadgeCollection,
  args: { breadcrumbs },
};

export const SomeEarned = {
  args: { player: { name: "Ada", age: "k1", badges: ["cvc/beginning-sound", "cvc/middle-sound", "chinese/colours"] } },
};
// Rainbow Speed Quest's badges show the fastest time (Within 10 done in 42 seconds).
export const WithSpeedRecord = {
  args: { player: { name: "Ada", age: "k1", badges: ["speed-quest/within-10"], records: { "speed-quest/within-10": 42500 } } },
};
export const NoneYet = { args: { player: { name: "Elly", age: "k3" } } };
