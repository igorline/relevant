import styled from 'styled-components/primitives';
import { mixins, sizing } from 'app/styles';

export const Image = styled.Image`
  height: ${sizing(3)};
  width: ${sizing(3)};
  ${mixins.margin}
  ${mixins.height}
  ${mixins.width}
  ${mixins.padding}
  ${mixins.background}
  ${mixins.borderRadius}
`;

export const ImageWrapper = styled.Text`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${mixins.margin}
`;
