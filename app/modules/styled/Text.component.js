import styled from 'styled-components/primitives';
import { colors, fonts, spacing } from 'app/styles/globalStyles';

export const Header = styled.Text`
  font-size: ${spacing.spacing(3)};
  ${fonts.HelveticaNeueBold}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const Title = styled.Text`
  font-size: ${spacing.spacing(2.5)};
  ${fonts.HelveticaNeueCondensedBold};
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const NumericalValue = styled.Text`
  font-size: ${spacing.spacing(1.75)};
  ${fonts.HelveticaNeueCondensedBold};
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const LinkWithIcon = styled.Text`
  font-size: ${spacing.spacing(1.5)};
  ${fonts.HelveticaNeueMedium};
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const AltLinkTitle = styled.Text`
  font-size: ${spacing.spacing(1.5)};
  ${fonts.HelveticaNeueMedium}
  color: ${(props) => props.color ? props.color : colors.black};
  text-decoration: underline;
`;

export const BodyText = styled.Text`
  font-size: ${spacing.spacing(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const SecondaryText = styled.Text`
  font-size: ${spacing.spacing(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const CTALink = styled.Text`
  font-size: ${spacing.spacing(1.5)};
  ${fonts.Helvetica}
  color: ${(props) => props.color ? props.color : colors.blue};
`;
