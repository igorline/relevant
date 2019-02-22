import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, StyledNavLink } from 'modules/styled/web';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import AuthContainer from 'modules/auth/web/auth.container';
import { View, Text } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors, layout, sizing } from 'app/styles';
import { showModal } from 'modules/navigation/navigation.actions';
import { getNotificationCount } from 'modules/activity/activity.actions';

const Nav = styled(View)`
  position: sticky;
  background-image: linear-gradient(hsla(0, 0%, 100%, 1) 70%, hsla(0, 0%, 100%, 0) 100%);
  z-index: 100;
  height: ${layout.headerHeight};
  padding: 0 ${sizing(4)};
  top: 0;
  left: ${layout.sideNavWidth};
`;

const Badge = styled(View)`
  border-radius: 108%;
  align-items: center;
  height: ${sizing(2)};
  width: ${sizing(2)};
  justify-content: center;
  display: flex;
  flex-direction: row;
  margin-bottom: ${sizing(1)};
`;

class TopNav extends Component {
  static propTypes = {
    location: PropTypes.object,
    auth: PropTypes.object,
    history: PropTypes.object,
    className: PropTypes.string,
    actions: PropTypes.object,
    notif: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getNotificationCount();
    window.addEventListener('focus', () => {
      this.props.actions.getNotificationCount();
    });
  }

  state = {
    openLoginModal: false
  };

  toggleLogin = () => {
    this.setState({ openLoginModal: !this.state.openLoginModal });
  };

  closeModal() {
    this.props.history.push(this.props.location.pathname);
  }

  render() {
    const { location, auth, className, actions, notif } = this.props;
    const { user } = auth;
    const temp = user && user.role === 'temp';
    return (
      <Nav
        className={className}
        justify="space-between"
        display="flex"
        fdirection="row"
        align="center"
      >
        <DiscoverTabs />
        <View
          justify="space-between"
          display="flex"
          fdirection="row"
          flex={1}
          grow={1}
          align="center"
        >
          {auth.isAuthenticated ? (
            <StyledNavLink
              to="/user/activity"
              hc={colors.black}
              c={colors.grey}
              fdirection="row"
              d="flex"
            >
              Activity
              {notif.count ? (
                <Badge bg={colors.red} ml={0.5}>
                  <Text c={colors.white} fw="bold" fs={1.25}>
                    {notif.count}
                  </Text>
                </Badge>
              ) : null}
            </StyledNavLink>
          ) : (
            <div />
          )}

          <View fdirection="row" d="flex" flex={1} align="center" justify="flex-end">
            <StyledNavLink
              onClick={e => {
                e.preventDefault();
                actions.showModal('onboarding');
              }}
              align={'center'}
              mr={2}
              hc={colors.black}
              c={colors.grey}
              to="/home"
            >
              Get Started
            </StyledNavLink>
            {auth.isAuthenticated ? (
              <Link to={location.pathname + '#newpost'} disabled={!auth.user}>
                <Button>New Post</Button>
              </Link>
            ) : (
              <Button onClick={this.toggleLogin} color={colors.blue}>
                Login
              </Button>
            )}
          </View>
        </View>
        <AuthContainer
          toggleLogin={this.toggleLogin.bind(this)}
          open={this.state.openLoginModal || temp}
          modal
          {...this.props}
        />
      </Nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    dispatch => ({
      actions: bindActionCreators(
        {
          showModal,
          getNotificationCount
        },
        dispatch
      )
    })
  )(TopNav)
);
