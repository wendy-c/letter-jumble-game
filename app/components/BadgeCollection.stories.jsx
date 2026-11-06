import BadgeCollection from "./BadgeCollection";
import Breadcrumbs from "./Breadcrumbs";

const breadcrumbs = <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My badges", href: "/badges" }]} />;

export default {
  title: "Components/Badges/BadgeCollection",
  component: BadgeCollection,
  args: { breadcrumbs },
};

export const SomeEarned = {
  args: { player: { name: "Ada", age: "k1", games: { cvc: { "beginning-sound": { badge: true }, "middle-sound": { badge: true } }, chinese: { colours: { badge: true } } } } },
};
// Rainbow Speed Quest's badges show the fastest time (Within 10 done in 42 seconds).
export const WithSpeedRecord = {
  args: { player: { name: "Ada", age: "k1", games: { "speed-quest": { "within-10": { badge: true, records: 42500 } } } } },
};
export const NoneYet = { args: { player: { name: "Elly", age: "k3" } } };
