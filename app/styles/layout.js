import * as colors from './colors';
import sizing from './sizing';

// TODO should we keep things consistent? Doesn't seem useful anymore
export const linkStyle = `
  text-decoration: none;
  color: ${props => props.color || 'black'}
`;

export const modalShadow = {
  boxShadow: '0 2px 6px hsl(0,0%,70%)'
};

export const headerHeight = sizing(16);
export const mainHeaderHeight = sizing(12);
export const sideNavWidth = sizing(40);

export const mediumScreenWidth = '714';
export const smallScreenWidth = '414';

// this is handled by mixins now — deprecated
export const universalBorder = (side, color, width) => `
  border${side ? `-${side}` : ''}-color: ${color || colors.lineColor};
  border${side ? `-${side}` : ''}-width: ${width || '1px'};
  border-style: solid;
`;

export const textRow = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const button = {
  background: colors.blue,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: sizing(6),
  minWidth: sizing(18),
  padding: `0 ${sizing(2)}`,
  fontSize: sizing(1.5),
  fontFamily: 'HelveticaNeue-Medium',
  margin: 0
};

export const tag = {
  ...button,
  cursor: 'pointer',
  background: colors.blue,
  minWidth: 0,
  height: sizing(4),
  padding: sizing(1.5)
};

export const animatedElement = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 10000,
  backgroundColor: 'transparent'
};
