import { LanguageContext } from "../app/i18n";
import "../app/globals.css";

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
  // The site's language (menus, the welcome card, Parent mode…), switched from the toolbar.
  // Games keep their own language whichever is chosen.
  globalTypes: {
    language: {
      description: "The site's language",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [{ value: "en", title: "English" }, { value: "zh", title: "繁體中文" }],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { language: "en" },
  parameters: {
    nextjs: { appDirectory: true },
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i } },
  },
  decorators: [
    (Story, { globals, parameters }) => (
      <LanguageContext.Provider value={globals.language ?? "en"}>
        {/* Components sit on the app's sky; whole pages (GameApp) bring their own. */}
        {parameters.page ? <Story /> : (
          <div className="app-shell" style={{ minHeight: "100vh", padding: 24 }}>
            <Story />
          </div>
        )}
      </LanguageContext.Provider>
    ),
  ],
};

export default preview;
