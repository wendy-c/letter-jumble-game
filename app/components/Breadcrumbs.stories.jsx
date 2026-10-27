import Breadcrumbs from "./Breadcrumbs";

export default {
  title: "Components/Navigation/Breadcrumbs",
  component: Breadcrumbs,
};

export const GameAndTopic = {
  args: { items: [{ label: "Home", href: "/" }, { label: "CVC Sounds", href: "/cvc" }, { label: "Beginning Sound", href: "/cvc/beginning-sound" }] },
};
export const OnePage = { args: { items: [{ label: "Home", href: "/" }, { label: "Parent mode", href: "/parent" }] } };
