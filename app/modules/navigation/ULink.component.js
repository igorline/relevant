import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { colors, mixins } from 'app/styles';

let styled;
let StyledLink;
let StyledNavLink;
let StyledA;
let DisabledLink;
let environment = 'web';


if (process.env.WEB !== 'true') {
  environment = 'native';
  styled = require('styled-components/primitives').default;
  StyledLink = styled.Touchable`
    ${(p) => p.styles}
    ${mixins.link}
  `;
  DisabledLink = styled.Text`
    color: ${colors.secondaryText};
    ${(p) => p.styles}
    ${mixins.link}
  `;
} else {
  styled = require('styled-components').default;
  StyledLink = styled(Link)`
    ${(p) => p.styles}
    ${mixins.link}
  `;
  StyledNavLink = styled(NavLink)`
    ${(p) => p.styles}
    ${mixins.link}
  `;
  StyledA = styled.a`
    ${(p) => p.styles}
    ${mixins.link}
  `;
  DisabledLink = styled.span`
    color: ${colors.secondaryText};
    ${(p) => p.styles}
    ${mixins.link}
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
    ...rest
  } = props;
  if (disabled) {
    return <DisabledLink {...rest}>{children}</DisabledLink>;
  }
  if (environment === 'web') {
    if (navLink) {
      return (
        <StyledNavLink {...rest} onClick={onClick} to={to} styles={styles || ''}>
          {children}
        </StyledNavLink>
      );
    }
    if (external) {
      return <StyledA {...rest} onClick={onClick} href={to} target={target} styles={styles || ''}>{children}</StyledA>;
    }

    return (
      <StyledLink {...rest} onClick={onClick} to={to} target={target} styles={styles || ''}>
        {children}
      </StyledLink>);
  }

  return (
    <StyledLink {...rest} onPress={onPress} styles={styles || ''}>
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
  styles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  external: PropTypes.bool,
  target: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ULink;
