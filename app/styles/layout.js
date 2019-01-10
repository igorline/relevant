export default {
  borderRight: (color) => ({
    borderRight: `1px solid ${color || 'black'}`,
  }),
  borderBottom: (color) => ({
    borderBottom: `1px solid ${color || 'black'}`
  }),
  borderStyles: (color) => `1px solid ${color || 'black'}`,
  headerHeight: '100px',
  sideNavWidth: '300px',
};
