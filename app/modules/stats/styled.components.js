import styled from 'styled-components/primitives';
import sizing from 'app/styles/sizing';

export const Icon = styled.Image`
  width: ${p => p.size ? sizing(p.size) : sizing(3)};
  height: ${p => p.size ? sizing(p.size) : sizing(3)};
  margin-right: ${p => p.size ? sizing(p.size / 4) : sizing(3 / 4)};
`;

export const IconWrapper = styled.Text`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-right: ${p =>
    typeof p.mr === 'number' ?
      sizing(p.mr) :
      sizing(1.5)};
`;
