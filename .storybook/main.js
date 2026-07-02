const path = require('path');

/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.mdx'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  docs: {
    defaultName: 'Docs',
  },
  async viteFinal(viteConfig) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    viteConfig.plugins = viteConfig.plugins || [];
    viteConfig.plugins.push(tailwindcss());
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
      '@': path.resolve(__dirname, '..', 'src'),
    };
    return viteConfig;
  },
};

module.exports = config;
