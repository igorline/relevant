import styled from 'styled-components/primitives';
import sizing from 'app/styles/sizing';

export const Icon = styled.Image`
  width: ${p => p.size ? sizing.byUnit(p.size) : sizing.byUnit(3)};
  height: ${p => p.size ? sizing.byUnit(p.size) : sizing.byUnit(3)};
  margin-right: ${p => p.size ? sizing.byUnit(p.size / 4) : sizing.byUnit(3 / 4)};
`;

export const IconWrapper = styled.Text`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-right: ${p =>
    typeof p.mr === 'number' ?
      sizing.byUnit(p.mr) :
      sizing.byUnit(1.5)};
`;
