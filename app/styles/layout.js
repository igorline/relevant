import colors from './colors';
let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default {
  borderRight: (color) => ({
    borderRight: `1px solid ${color || 'black'}`,
  }),
  borderBottom: (color) => ({
    borderBottom: `1px solid ${color || 'black'}`
  }),
  borderStyles: (color) => `1px solid ${color || 'black'}`,
  universalBorder: (side, color, width) => `
      border${side ? `-${side}` : ''}-color: ${color || colors.lineColor};
      border${side ? `-${side}` : ''}-width: ${width || '1px'};
      border${side ? `-${side}` : ''}-style: solid;
    `,
  headerHeight: '100px',
  sideNavWidth: '300px',
  linkStyle: `
  text-decoration: none;
    color: ${(props) => props.color || 'black'}
  `,
  spacing: (unit) => {
    if (isNative) {
      return `${(unit * 8 / 10)}rem`;
    }
    return `${unit * 8}px`;
  }
};
