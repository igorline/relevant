import styled, { css } from 'styled-components/primitives';
import { colors, fonts, sizing } from 'app/styles';
import { linkStyles, altLinkStyles, lh } from 'app/styles/fonts';


export const Header = styled.Text`
  font-size: ${sizing(3)};
  line-height: ${sizing(3 * lh)};
  ${fonts.HelveticaNeueBold}
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const Title = styled.Text`
  display: flex;
  font-size: ${sizing(2.5)};
  line-height: ${sizing(2.5 * lh)};
  ${fonts.HelveticaNeueCondensedBold}
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const NumericalValue = styled.Text`
  font-size: ${p => p.inherit ? 'inherit' : sizing(2)};
  line-height: ${p => p.inherit ? 'inherit' : sizing(2)};
  font-family: ${p => p.inherit ? 'inherit' : 'HelveticaNeue-CondensedBold'};
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const LinkWithIcon = css`
  ${linkStyles}
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const AltLinkTitle = styled.Text`
  ${altLinkStyles}
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const BodyText = styled.Text`
  font-size: ${sizing(1.5)};
  line-height: ${sizing(1.5 * lh)};
  ${fonts.Helvetica}
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const CommentText = styled.Text`
  font-size: ${sizing(1.75)};
  line-height: ${sizing(1.75 * lh)};
  ${fonts.Georgia}
  color: ${(p) => p.color ? p.color : colors.black};
`;

export const SecondaryText = styled.Text`
  display: flex;
  font-size: ${sizing(1.5)};
  line-height: ${sizing(1.5 * lh)};
  ${fonts.Helvetica}
  color: ${(p) => p.color ? p.color : colors.secondaryText};
`;

export const CTALink = styled.Text`
  font-size: ${sizing(1.5)};
  line-height: ${sizing(1.5)};
  ${fonts.Helvetica}
  color: ${(p) => p.color ? p.color : colors.blue};
`;

export const Button = styled.Touchable`
  background: ${colors.blue};
  color: white;
  display: flex;
  align-items: center;
  border: none;
  justify-content: space-between;
  height: ${sizing(16)};
  min-width: ${sizing(18)};
  padding: 0  ${sizing(2)};
  font-size: ${sizing(1.5)};
  ${fonts.HelveticaNeueMedium}
`;

