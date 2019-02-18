import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { colors, mixins } from 'app/styles';
import { Touchable } from 'modules/styled/uni';

let { css } = require('styled-components');

let styled;
let StyledLink;
let StyledNavLink;
let StyledA;
let DisabledLink;
let environment = 'web';

const linkStyles = css`
  ${p => p.styles}
  ${mixins.link}
  ${mixins.margin}
  ${mixins.padding}
`;

if (process.env.WEB !== 'true') {
  environment = 'native';
  styled = require('styled-components/primitives').default;
  css = require('styled-components/primitives').css;
  StyledLink = styled(Touchable)`
    ${linkStyles}
  `;
  DisabledLink = styled.Text`
    ${p => (p.disabled ? `color: ${colors.secondaryText};` : '')}
    ${linkStyles}
  `;
} else {
  styled = require('styled-components').default;

  StyledLink = styled(Link)`
    ${linkStyles}
  `;
  StyledNavLink = styled(NavLink)`
    ${linkStyles}
  `;
  StyledA = styled.a`
    ${linkStyles}
  `;
  DisabledLink = styled.span`
    ${p => (p.disabled ? `color: ${colors.secondaryText};` : '')}
    ${linkStyles}
  `;
}

const ULink = props => {
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
    noLink,
    ...rest
  } = props;
  if (disabled || noLink) {
    return (
      <DisabledLink {...rest} disabled={disabled}>
        {children}
      </DisabledLink>
    );
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
      return (
        <StyledA
          {...rest}
          onClick={onClick}
          href={to}
          target={target}
          styles={styles || ''}
        >
          {children}
        </StyledA>
      );
    }

    return (
      <StyledLink
        {...rest}
        onClick={onClick}
        to={to}
        target={target}
        styles={styles || ''}
      >
        {children}
      </StyledLink>
    );
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
  styles: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  external: PropTypes.bool,
  target: PropTypes.string,
  disabled: PropTypes.bool,
  noLink: PropTypes.bool
};

export default ULink;
