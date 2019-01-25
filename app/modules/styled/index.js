import styled from 'styled-components/primitives';
import { colors, fonts, sizing } from 'app/styles/globalStyles';

const lhMult = 1.33333;

export const Header = styled.Text`
  font-size: ${sizing.byUnit(3)};
  line-height: ${sizing.byUnit(3 * lhMult)};
  ${fonts.HelveticaNeueBold}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const Title = styled.Text`
  display: flex;
  font-size: ${sizing.byUnit(2.5)};
  line-height: ${sizing.byUnit(2.5 * lhMult)};
  ${fonts.HelveticaNeueCondensedBold}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const NumericalValue = styled.Text`
  font-size: ${p => p.inherit ? 'inherit' : sizing.byUnit(2)};
  line-height: ${p => p.inherit ? 'inherit' : sizing.byUnit(2)};
  font-family: ${p => p.inherit ? 'inherit' : 'HelveticaNeue-CondensedBold'};
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const LinkWithIcon = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5 * lhMult)};
  ${fonts.HelveticaNeueMedium}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const AltLinkTitle = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5 * lhMult)};
  ${fonts.HelveticaNeueMedium}
  color: ${(props) => props.color ? props.color : colors.black};
  text-decoration: underline;
`;

export const BodyText = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5 * lhMult)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const CommentText = styled.Text`
  font-size: ${sizing.byUnit(1.75)};
  line-height: ${sizing.byUnit(1.75 * lhMult)};
  ${fonts.Georgia}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const SecondaryText = styled.Text`
  display: flex;
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5 * lhMult)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const CTALink = styled.Text`
  font-size: ${sizing.byUnit(1.5)};
  line-height: ${sizing.byUnit(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.blue};
`;

