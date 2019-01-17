import styled from 'styled-components/primitives';
import { colors } from 'app/styles/globalStyles';

export const Title = styled.Text`
  font-weight: bold;
  font-size: 20;
  font-family: Arial;
  font-family: Bebas;
  color: ${colors.black};
  color: ${(props) => props.color ? props.color : colors.black};
`;

export const SecondaryText = styled.Text`
  font-size: 12;
  font-family: Arial;
  color: ${colors.secondaryTextColor};
  color: ${(props) => props.color ? props.color : colors.secondaryTextColor};
`;

export const ContentText = styled.Text`
  font-size: 12;
  font-family: 'Georgia', sans-serif;
  color: ${colors.secondaryTextColor};
  color: ${(props) => props.color ? props.color : colors.secondaryTextColor};

`;

export const PrimaryLink = styled.Text`
  font-size: 12;
  color: ${colors.blue};
  color: ${(props) => props.color ? props.color : colors.blue};
  text-decoration: none;
`;

export const SecondaryLink = styled.Text`
  font-weight: 12;
  color: ${colors.secondaryTextColor};
  color: ${(props) => props.color ? props.color : colors.secondaryTextColor};
  text-decoration: none;
`;
