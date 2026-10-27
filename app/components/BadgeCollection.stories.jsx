import BadgeCollection from "./BadgeCollection";
import Breadcrumbs from "./Breadcrumbs";

const breadcrumbs = <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My badges", href: "/badges" }]} />;

export default {
  title: "Components/Badges/BadgeCollection",
  component: BadgeCollection,
  args: { breadcrumbs },
};

export const SomeEarned = {
  args: { player: { name: "Ada", age: "3-4", badges: ["cvc/beginning-sound", "cvc/middle-sound", "chinese/colours"] } },
};
export const NoneYet = { args: { player: { name: "Elly", age: "5-6" } } };
