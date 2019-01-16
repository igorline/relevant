import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';

let styled;
let StyledLink;
let StyledNavLink;
let environment = 'web';
if (process.env.WEB !== 'true') {
  environment = 'native';
  styled = require('styled-components/primitives').default;
  StyledLink = styled(Link)`
    ${(p) => p.styles}
  `;
} else {
  styled = require('styled-components').default;
  StyledLink = styled(Link)`
    ${(p) => p.styles}
  `;
  StyledNavLink = styled(NavLink)`
    ${(p) => p.styles}
  `;
}

const ULink = (props) => {
  const { onClick, onPress, to, styles, children, navLink } = props;
  if (environment === 'web') {
    return navLink ?
      <StyledNavLink onClick={onClick} to={to} styles={styles || ''}>
        {children}
      </StyledNavLink> :
      <StyledLink onClick={onClick} to={to} styles={styles || ''}>
        {children}
      </StyledLink>;
  }

  return (
    <StyledLink onPress={onPress} styles={styles || ''}>
      {children}
    </StyledLink>
  );
};

ULink.propTypes = {
  navLink: PropTypes.bool,
  children: PropTypes.node,
  to: PropTypes.string,
  onPress: PropTypes.func,
  onClick: PropTypes.func,
  styles: PropTypes.string,
};

export default ULink;
