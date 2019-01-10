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
  // boxShadowRight: (color) => `1px solid ${ color || black}`
  // boxShadowRight: (color) => ({
  //   boxShadow: `2px 0px 5px -2.5px ${color || 'black'}`,
  // }),
  // boxShadowBottom: (color) => ({
  //   boxShadow: `0px 2px 5px -2.5px ${color || 'black'}`,
  // }),
};

export {
  colors,
  layout,
  mixins,
};
