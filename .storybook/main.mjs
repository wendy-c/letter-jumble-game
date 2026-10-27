// Storybook for The Rainbow Academy: every component (stories next to each one in
// app/components), whole pages and the pictures in public/ (stories/). Run `npm run storybook`.
/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx)", "../app/**/*.stories.@(js|jsx)"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/nextjs-vite", options: {} },
  staticDirs: ["../public"],
};

export default config;
