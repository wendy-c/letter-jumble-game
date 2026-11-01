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
    // The sidebar keeps the order the stories load in, except each class's Daily Challenge levels
    // always go 1 to 20 (Storybook reads this without running it, so the lists are written out).
    options: {
      storySort: {
        order: [
          "Introduction", "Assets", "Game Questions", "Pages",
          "Challenge", [
            "Daily Challenge", [
              "K1", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10",
                "Level 11", "Level 12", "Level 13", "Level 14", "Level 15", "Level 16", "Level 17", "Level 18", "Level 19", "Level 20"],
              "K2", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10",
                "Level 11", "Level 12", "Level 13", "Level 14", "Level 15", "Level 16", "Level 17", "Level 18", "Level 19", "Level 20"],
              "K3", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10",
                "Level 11", "Level 12", "Level 13", "Level 14", "Level 15", "Level 16", "Level 17", "Level 18", "Level 19", "Level 20"],
            ],
            "Rainbow Speed Quest",
          ],
          "Components",
        ],
      },
    },
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
