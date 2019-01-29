import styled from 'styled-components';
import { mixins, sizing } from 'app/styles';

export const View = styled.div`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
`;

export const Text = styled.span`
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.flex}
`;

export const Image = styled.img`
  height: ${sizing(3)};
  width: ${sizing(3)};
  ${mixins.margin}
  ${mixins.height}
  ${mixins.width}
  ${mixins.padding}
  ${mixins.background}
  ${mixins.borderRadius}
`;

export const ImageWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${mixins.margin}
`;
