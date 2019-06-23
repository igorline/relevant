import { View } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';

export const CountUpContainer = styled(View)`
  flex: 1;
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;

export const CountUpSpacer = styled(View)`
  max-width: ${sizing(30)};
`;
