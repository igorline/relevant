import { colors, fonts, sizing } from 'app/styles';

// TODO how to best deal with this?
export const tabStyles = `
  color: ${colors.grey};
  font-size: ${sizing(3)};
  line-height: ${sizing(3 * fonts.lh)};
  ${fonts.HelveticaNeueBold}
  &.active {
    color: ${colors.black};
    fontWeight: 'bold'
  }
`;
