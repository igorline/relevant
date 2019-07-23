import styled from 'styled-components';

export const Warning = styled.div`
  position: absolute;
  left: 48px;
  right: 48px;
  top: ${props => (props.id <= 2 ? '37.98%' : '37.5%')};
  bottom: ${props => (props.styling ? props.styling.bottom : '29.97%')};
  background: ${props =>
    props.styling ? props.styling.background : 'rgba(0, 0, 0, 0.05)'};
  border: 2px solid ${props => (props.styling ? props.styling.borderColor : '#000000')};
  box-sizing: border-box;
`;
