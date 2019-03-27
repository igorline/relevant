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
let DisabledLinkText;
let DisabledLinkView;
let environment = 'web';

const linkStyles = css`
  ${p => p.styles}
  color: ${colors.blue};
  ${mixins.link}
  ${mixins.margin}
  ${mixins.padding}
  ${mixins.color}
  :hover * {
    ${p => (p.hc ? `color: ${p.hc}` : '')}
    ${p => (p.hu ? 'text-decoration: underline' : '')}
  }
`;

if (process.env.WEB !== 'true') {
  environment = 'native';
  styled = require('styled-components/primitives').default;
  StyledLink = styled.Touchable``;
  DisabledLinkText = styled.Text``;
  DisabledLinkView = styled.View``;
} else {
  styled = require('styled-components').default;
  StyledLink = styled(Link)`
    ${linkStyles}
    ${mixins.cursor}
  `;
  StyledNavLink = styled(NavLink)`
    ${linkStyles}
    ${mixins.cursor}
  `;
  StyledA = styled.a`
    ${linkStyles}
  `;
  DisabledLink = styled.span`
    ${p => (p.disabled ? `color: ${colors.secondaryText};` : '')}
    ${linkStyles}
    ${mixins.cursor}
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
      type,
      hu,
      inline,
      ...rest
    } = this.props;

    // ------ WEB -----------
    if (environment === 'web') {
      if (disabled || noLink) {
        return (
          <DisabledLink
            {...rest}
            hu={hu ? 1 : 0}
            inline={inline ? 1 : 0}
            styles={styles || ''}
          >
            {children}
          </DisabledLink>
        );
      }
      if (navLink) {
        return (
          <StyledNavLink
            {...rest}
            hu={hu ? 1 : 0}
            inline={inline ? 1 : 0}
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
            hu={hu ? 1 : 0}
            inline={inline ? 1 : 0}
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
          hu={hu ? 1 : 0}
          inline={inline ? 1 : 0}
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

    // ------ NATIVE -----------
    if (disabled || noLink) {
      if (type === 'text') {
        return <DisabledLinkText>{children}</DisabledLinkText>;
      }

      return <DisabledLinkView flex={1}>{children}</DisabledLinkView>;
    }

    return (
      <StyledLink
        // {...rest}
        to={to || '#'}
        onPress={onPress}
        // onPress={this.checkAuth(onPress)}
        // styles={styles || ''}
      >
        {children}
      </StyledLink>
    );
  }
}

ULinkComponent.propTypes = {
  inline: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  hu: PropTypes.bool,
  type: PropTypes.string,
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
