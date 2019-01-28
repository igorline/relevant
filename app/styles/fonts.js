import sizing from './sizing';
import * as colors from './colors';

export const HelveticaNeueBold = "font-family: 'HelveticaNeue-Bold';";
export const HelveticaNeueCondensedBold = "font-family: 'HelveticaNeue-CondensedBold';";
export const HelveticaNeueMedium = "font-family: 'HelveticaNeue-Medium';";
export const HelveticaNeue = "font-family: 'HelveticaNeue';";
export const Georgia = "font-family: 'Georgia';";

export const lh = 4 / 3;

export const linkStyles = {
  fontSize: sizing.byUnit(1.5),
  lineHeight: sizing.byUnit(1.5 * lh),
  fontFamily: 'HelveticaNeue-Medium',
  color: colors.grey,
  padding: `${sizing.byUnit(0.5)} 0`,
};

export const altLinkStyles = {
  ...linkStyles,
  textDecoration: 'underline',
};

export const bodyStyle = {
  fontSize: sizing.byUnit(1.5),
  lineHeight: sizing.byUnit(1.5 * lh),
  fontFamily: 'HelveticaNeue',
};
