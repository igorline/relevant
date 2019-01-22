import styled from 'styled-components/primitives';
import { colors, fonts } from 'app/styles/globalStyles';

export const Header = styled.Text`
  font-weight: bold;
  font-size: 24;
  font-family: Arial;
  ${fonts.Helvetica}
  color: ${colors.black};
  color: ${(props) => props.color ? props.color : colors.black};
`;


export const Title = styled.Text`
  font-weight: bold;
  font-size: 20;
  font-family: Arial;
  ${fonts.Helvetica}
  color: ${colors.black};
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const SecondaryText = styled.Text`
  font-size: 12;
  font-family: Arial;
  color: ${colors.secondaryText};
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const BodyText = styled.Text`
  font-size: 12;
  font-family: serif;
  font-family: 'Georgia';
  /* font-family: "Times New Roman", Times, serif; */
  color: ${colors.secondaryText};
  color: ${(props) => props.color ? props.color : colors.secondaryText};
`;

export const PrimaryLink = styled.Text`
  font-size: 12;
  color: ${colors.blue};
  color: ${(props) => props.color ? props.color : colors.blue};
  text-decoration: none;
`;

export const SecondaryLink = styled.Text`
  font-weight: 12;
  color: ${colors.secondaryText};
  color: ${(props) => props.color ? props.color : colors.secondaryText};
  text-decoration: none;
`;
