import { colors, fonts, sizing } from 'app/styles/globalStyles';

const lhMult = 1.33333;

// TODO how to best deal with this?
export const tabStyles = `
  color: ${colors.grey};
  font-size: ${sizing.byUnit(3)};
  line-height: ${sizing.byUnit(3 * lhMult)};
  ${fonts.HelveticaNeueBold}
  &.active {
    color: ${colors.black};
    fontWeight: 'bold'
  }
`;
