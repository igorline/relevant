import colors from 'app/styles/colors';

const mixins = {};

const layout = {
  boxShadowRight: (color) => ({
    borderRight: `1px solid ${color || 'black'}`,
  }),
  boxShadowBottom: (color) => ({
    borderBottom: `1px solid ${color || 'black'}`
  }),
  borderStyles: (color) => `1px solid ${color || 'black'}`,
};

export {
  colors,
  layout,
  mixins,
};
