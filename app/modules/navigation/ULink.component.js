import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { colors } from 'app/styles/globalStyles';

let styled;
let StyledLink;
let StyledNavLink;
let StyledA;
let DisabledLink;
let environment = 'web';


if (process.env.WEB !== 'true') {
  environment = 'native';
  styled = require('styled-components/primitives').default;
  StyledLink = styled(Link)`
    ${(p) => p.styles}
  `;
  DisabledLink = styled.Text`
    color: ${colors.secondaryText};
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
  StyledA = styled.a`
    ${(p) => p.styles}
  `;
  DisabledLink = styled.span`
    color: ${colors.secondaryText};
    ${(p) => p.styles}
  `;
}



const ULink = (props) => {
  const {
    onClick,
    onPress,
    to,
    styles,
    children,
    navLink,
    external,
    target,
    disabled,
  } = props;
  if (disabled) {
    return <DisabledLink>{children}</DisabledLink>;
  }
  if (environment === 'web') {
    if (navLink) {
      return (
        <StyledNavLink onClick={onClick} to={to} styles={styles || ''}>
          {children}
        </StyledNavLink>
      );
    }
    if (external) {
      return <StyledA onClick={onClick} href={to} target={target} styles={styles || ''}>{children}</StyledA>;
    }

    return (
      <StyledLink onClick={onClick} to={to} target={target} styles={styles || ''}>
        {children}
      </StyledLink>);
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
  external: PropTypes.bool,
  target: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ULink;
