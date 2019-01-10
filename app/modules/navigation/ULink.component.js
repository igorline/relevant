import React from 'react';
import PropTypes from 'prop-types';
import { Touchable } from 'react-primitives';
import { Link } from 'react-router-dom';


import styled from 'styled-components';
// import styled from 'styled-components/primitives';

let environment = 'web';
if (process.env.WEB !== 'true') {
  environment = 'native';
}
// let styled;
//
// if (environment === 'web') {
//   styled = require('styled-components').default;
// } else {
//   styled = require('styled-components/primitives').default;
// }


const StyledLink = styled(Link)`
  ${(p) => p.styles}
`;
// const StyledTouchable = styled.Touchable`
//   ${(p) => p.styles},
// `;

const ULink2 = (props) => {
  const { onClick, onPress, to, styles, children } = props;
  if (environment === 'web') {
    return <StyledLink onClick={onClick} to={to} styles={styles || ''}>{children}</StyledLink>;
  }

  return (
    <StyledTouchable onPress={onPress} styles={styles || ''}>
      {children}
    </StyledTouchable>
  );
};

ULink2.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  onPress: PropTypes.func,
  onClick: PropTypes.func,
  style: PropTypes.object,
};

export default ULink2;
