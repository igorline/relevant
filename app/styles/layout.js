import * as colors from './colors';
import sizing, { size } from './sizing';
// import { size } from './mixins';

// TODO should we keep things consistent? Doesn't seem useful anymore
export const linkStyle = `
  text-decoration: none;
  color: ${props => props.color || 'black'}
`;

export const activeButtonShadow = {
  boxShadow: '0 2px 6px hsl(240,0%,70%);'
};

export const modalShadow = {
  boxShadow: '0 2px 6px hsl(0,0%,70%)'
};

const s = 1;

export const AVATAR_SIZE = 4 * s;
export const POST_IMAGE_H = 10 * s;
export const POST_IMAGE_W = 20 * s;
export const CENTER_BUTTON_SIZE = 4.5 * s;
export const VOTE_BUTTON_SIZE = 2.75 * s;
export const SIDE_NAV_PADDING = 3;
export const MAX_POST_WIDTH = 120;

export const DESKTOP_PADDING = 4;

export const BANNER_PROMPT_HEIGHT = size([5, 7]);

export const headerHeight = sizing(10);
export const mainHeaderHeight = sizing(10);
export const sideNavWidth = sizing(37);

export const NESTING_UNIT = 3;
export const POST_BUTTONS_NESTING_UNITS = 4;
// export const POST_BUTTONS_UNITS = 4;
export const POST_BUTTONS_WIDTH = POST_BUTTONS_NESTING_UNITS * NESTING_UNIT;

export const NESTING_UNIT_RESONSIVE = 2;
export const POST_BUTTONS_WIDTH_RESPONSIVE =
  POST_BUTTONS_NESTING_UNITS * NESTING_UNIT_RESONSIVE;

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

export const buttonFont = {
  fontSize: sizing(1.5),
  color: colors.white,
  fontFamily: 'HelveticaNeue-Medium'
};

export const button = {
  background: colors.blue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: size(6),
  minWidth: size([18, 15]),
  padding: `0 ${sizing(2)}`,
  margin: 0
};

export const tag = {
  ...button,
  cursor: 'pointer',
  background: colors.blue,
  color: colors.white,
  minWidth: 0,
  height: sizing(4),
  padding: sizing(1.5),
  fontSize: sizing(1.5)
};

export const animatedElement = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 10000,
  backgroundColor: 'transparent'
};

export const formImageProps = {
  p: 2,
  w: 9,
  h: 9,
  m: '1 0 0 0',
  bradius: '50%'
};
