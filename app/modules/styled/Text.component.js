import styled from 'styled-components/primitives';
import { colors, fonts, sizing } from 'app/styles/globalStyles';

export const Header = styled.Text`
  font-size: ${sizing.byUnit(3)};
  line-height: ${sizing.byUnit(3)};
  ${fonts.HelveticaNeueBold}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const Title = styled.Text`
  font-size: ${sizing.byUnit(2.5)};
  line-height: ${sizing.byUnit(2.5)};
  ${fonts.HelveticaNeueCondensedBold}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const NumericalValue = styled.Text`
  font-size: ${sizing.byUnit(1.75)};
  line-height: ${sizing.byUnit(1.75)};
  ${fonts.HelveticaNeueCondensedBold}
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const LinkWithIcon = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.HelveticaNeueMedium}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const AltLinkTitle = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.HelveticaNeueMedium}
  color: ${(props) => props.color ? props.color : colors.black};
  text-decoration: underline;
`;

export const BodyText = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const CommentText = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.Georgia}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const SecondaryText = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const CTALink = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.blue};
`;
