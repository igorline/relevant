import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { Button, StyledNavLink } from 'modules/styled/web';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import AuthContainer from 'modules/auth/web/auth.container';
import { View, Text, LinkFont } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors, layout, sizing } from 'app/styles';
import { showModal } from 'modules/navigation/navigation.actions';
import { getNotificationCount } from 'modules/activity/activity.actions';
import Ulink from 'modules/navigation/ULink.component';

const Nav = styled(View)`
  position: sticky;
  background-image: linear-gradient(hsla(0, 0%, 100%, 1) 80%, hsla(0, 0%, 100%, 0) 100%);
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
    notif: PropTypes.object,
    community: PropTypes.object,
    view: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getNotificationCount();
    window.addEventListener('focus', () => {
      this.getNotificationCount();
    });
  }

  componentDidUpdate(prevProps) {
    const wasNotAuthenticated = !prevProps.auth.isAuthenticated;
    const { isAuthenticated } = this.props.auth;
    if (wasNotAuthenticated && isAuthenticated) this.getNotificationCount();
  }

  getNotificationCount = () => {
    const now = new Date();
    const { isAuthenticated } = this.props.auth;
    if (now - this.state.timeSinceNotificationCount < 30000) return;
    if (isAuthenticated) {
      this.props.actions.getNotificationCount();
      this.setState({ timeSinceNotificationCount: now });
    }
  };

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
    const { location, auth, className, actions, notif, community, view } = this.props;
    const { user } = auth;
    const temp = user && user.role === 'temp';
    const activeCommunity = get(community, `communities.${view.discover.community}`);
    return (
      <Nav className={className} fdirection="column" justify="center">
        <View justify="space-between" display="flex" fdirection="row" align="center">
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
              <Ulink
                onClick={e => {
                  e.preventDefault();
                  actions.showModal('onboarding');
                }}
                align={'center'}
                mr={2}
                hu
                color={colors.blue}
                to="/home"
              >
                <LinkFont c={colors.blue}>Get Started</LinkFont>
              </Ulink>
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
        </View>
        <View fdirection="row">
          {activeCommunity ? (
            <StyledNavLink
              lh={1.5}
              fs={1.5}
              to={`/${view.discover.community}/${view.discover.sort}`}
            >
              {activeCommunity.name}{' '}
            </StyledNavLink>
          ) : null}
          {view.discover && view.discover.tag ? (
            <View fdirection="row">
              <StyledNavLink
                lh={1.5}
                fs={1.5}
                to={`/${view.discover.community}/${view.discover.sort}/${
                  view.discover.tag
                }`}
              >
                &nbsp;→ #{view.discover.tag}
              </StyledNavLink>
            </View>
          ) : null}
        </View>
      </Nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif,
    community: state.community,
    view: state.view
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
