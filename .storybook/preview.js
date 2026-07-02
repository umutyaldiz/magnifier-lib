import './tailwind.css';

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Magnifier', ['Playground', '*']],
      },
    },
  },
};

export default preview;
