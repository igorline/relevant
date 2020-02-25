import sizing from './sizing';
import * as colors from './colors';

export const HELVETICA_NEUE_BOLD = 'HelveticaNeue-Bold';
export const HELVETICA_NEUE_CONDENSED_BOLD = 'HelveticaNeue-CondensedBold';
export const HELVETICA_NEUE_MEDIUM = 'HelveticaNeue-Medium';
export const HELVETICA_NEUE = 'HelveticaNeue';
export const HELVETICA_REGULAR = 'HelveticaNeue';
export const GEORGIA = 'Georgia';

export const HelveticaNeueBold = `font-family: '${HELVETICA_NEUE_BOLD}';`;
export const HelveticaNeueCondensedBold = `font-family: '${HELVETICA_NEUE_CONDENSED_BOLD}';`;
export const HelveticaNeueMedium = `font-family: '${HELVETICA_NEUE_MEDIUM}';`;
export const HelveticaNeue = `font-family: '${HELVETICA_NEUE}';`;
export const Georgia = `font-family: '${GEORGIA}';`;

export const lh = 1.4;

export const bodyStyle = {
  fontSize: sizing(1.75),
  lineHeight: sizing(1.75 * lh),
  fontFamily: HELVETICA_REGULAR,
  color: colors.black
};

export const header = {
  fontSize: sizing(3),
  lineHeight: sizing(3 * lh),
  fontFamily: HELVETICA_NEUE_BOLD,
  color: colors.black
};

export const highlight = {
  fontSize: sizing(2.5),
  lineHeight: sizing(2.5 * lh),
  fontFamily: GEORGIA,
  fontStyle: 'italic',
  color: colors.black
};

export const title = {
  // display: 'flex',
  fontSize: sizing(2.5),
  lineHeight: sizing(2.5 * lh),
  fontFamily: HELVETICA_NEUE_CONDENSED_BOLD,
  color: colors.black
};

// REQUIRES FONT-INHERIT
export const numericalValue = {
  fontSize: sizing(1.75),
  lineHeight: sizing(1.75 * lh),
  fontFamily: HELVETICA_NEUE_CONDENSED_BOLD,
  color: colors.black
};

export const link = {
  fontSize: sizing(1.5),
  lineHeight: sizing(1.5 * lh),
  fontFamily: HELVETICA_NEUE_MEDIUM,
  color: colors.grey
  // padding: `${sizing(0.5)} 0`
};

export const altLink = {
  ...link,
  textDecoration: 'underline'
};

// export const bodyText = {
//   fontSize: sizing(1.5),
//   lineHeight: sizing(1.5 * lh),
//   fontFamily: HELVETICA_REGULAR,
//   color: colors.black
// };

export const commentText = {
  fontSize: sizing(2),
  lineHeight: sizing(2 * lh),
  fontFamily: GEORGIA,
  color: colors.black
};

export const secondaryText = {
  fontSize: sizing(1.5),
  lineHeight: sizing(1.5 * lh),
  fontFamily: HELVETICA_REGULAR,
  color: colors.secondaryText
};

export const communityLink = {
  fontSize: sizing(1.75),
  lineHeight: sizing(1.75 * lh),
  fontFamily: HELVETICA_REGULAR,
  color: colors.grey
};

export const CTALink = {
  fontSize: sizing(1.5),
  lineHeight: sizing(1.5 * lh),
  fontFamily: HELVETICA_REGULAR,
  color: colors.blue
};

export const button = {
  background: colors.blue,
  color: colors.white,
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  justifyContent: 'space-between',
  height: sizing(16),
  minWidth: sizing(18),
  padding: `0  ${sizing(2)}`,
  fontsize: sizing(1.5),
  fontFamily: HELVETICA_NEUE_MEDIUM
};
