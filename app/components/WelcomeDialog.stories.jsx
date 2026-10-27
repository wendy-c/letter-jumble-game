import { fn } from "storybook/test";
import WelcomeDialog from "./WelcomeDialog";

// Its language is the site's: switch it with the Language button in the toolbar.
export default {
  title: "Components/Cards/WelcomeDialog",
  component: WelcomeDialog,
  args: { onClose: fn() },
  render: (args, { globals }) => <WelcomeDialog {...args} language={globals.language ?? "en"} />,
};

export const NewFamily = { args: { onCreate: fn(() => null) } };
export const ReturningFamily = {};
