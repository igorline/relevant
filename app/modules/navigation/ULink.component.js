import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { colors, mixins } from 'app/styles';
import { css } from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { showModal } from 'modules/navigation/navigation.actions';
import { Alert } from 'app/utils/alert';

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
  StyledLink = styled.Touchable`
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

export class ULinkComponent extends Component {
  checkAuth = (e, callback) => {
    const {
      auth,
      // actions,
      authrequired
    } = this.props;
    if (!authrequired) {
      try {
        callback(e);
      } catch (err) {
        // handle err
      }
    } else if (authrequired && !auth.isAuthenticated) {
      e.preventDefault();
      // TODO: use this in future
      // actions.showModal('auth');
      Alert().alert('You must be signed in to do this');
    } else {
      try {
        callback(e);
      } catch (err) {
        // handle err
      }
    }
  };
  render() {
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
      auth,
      authrequired,
      ...rest
    } = this.props;
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
          <StyledNavLink
            {...rest}
            onClick={e => {
              this.checkAuth(e, onClick);
            }}
            to={to || '#'}
            styles={styles || ''}
          >
            {children}
          </StyledNavLink>
        );
      }
      if (external) {
        return (
          <StyledA
            {...rest}
            onClick={e => {
              this.checkAuth(e, onClick);
            }}
            href={to || '#'}
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
          onClick={e => {
            this.checkAuth(e, onClick);
          }}
          to={to}
          target={target}
          styles={styles || ''}
        >
          {children}
        </StyledLink>
      );
    }

    return (
      <StyledLink
        {...rest}
        to={to || '#'}
        onPress={this.checkAuth(onPress)}
        styles={styles || ''}
      >
        {children}
      </StyledLink>
    );
  }
}

ULinkComponent.propTypes = {
  navLink: PropTypes.bool,
  children: PropTypes.node,
  to: PropTypes.string,
  onPress: PropTypes.func,
  onClick: PropTypes.func,
  styles: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  external: PropTypes.bool,
  target: PropTypes.string,
  disabled: PropTypes.bool,
  noLink: PropTypes.bool,
  auth: PropTypes.object,
  actions: PropTypes.object,
  authrequired: PropTypes.bool
};

export default connect(
  state => ({
    auth: state.auth
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        showModal
      },
      dispatch
    )
  })
)(ULinkComponent);
