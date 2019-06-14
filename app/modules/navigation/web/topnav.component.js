import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, StyledNavLink } from 'modules/styled/web';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Link } from 'react-router-dom';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import Breadcrumbs from 'modules/navigation/web/breadcrumbs.component';
import { View, Text, LinkFont, Header } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import styledComponents from 'styled-components';
import { colors, layout, sizing } from 'app/styles';
import { showModal } from 'modules/navigation/navigation.actions';
import { getNotificationCount } from 'modules/activity/activity.actions';
import Ulink from 'modules/navigation/ULink.component';
import MenuIcon from 'modules/ui/web/menuIcon.component';

const Nav = styled(View)`
  position: sticky;
  background-image: linear-gradient(hsla(0, 0%, 100%, 1) 80%, hsla(0, 0%, 100%, 0) 100%);
  z-index: 100;
  height: ${layout.headerHeight};
  top: ${p => (p.top ? p.top : 0)};
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

const ActionButton = styledComponents(Button)`
  ${p =>
    !p.screenSize
      ? ''
      : `
    position: fixed;
    bottom: ${sizing(2)};
    right: ${sizing(2)};
    height: ${sizing(10)};
    width: ${sizing(10)};
    min-width: 0;
    border-radius: 100%;
    background-color: ${colors.blue};
  `}
`;

class TopNav extends Component {
  static propTypes = {
    location: PropTypes.object,
    auth: PropTypes.object,
    history: PropTypes.object,
    actions: PropTypes.object,
    notif: PropTypes.object,
    screenSize: PropTypes.number,
    title: PropTypes.string
  };

  state = {};

  componentDidMount() {
    this.getNotificationCount();
    window.addEventListener('focus', getNotificationCount);
  }

  componentDidUpdate(prevProps) {
    const wasNotAuthenticated = !prevProps.auth.isAuthenticated;
    const { isAuthenticated } = this.props.auth;
    if (wasNotAuthenticated && isAuthenticated) this.getNotificationCount();
  }

  getNotificationCount = () => {
    const now = new Date();
    const { isAuthenticated } = this.props.auth;
    if (
      this.state.timeSinceNotificationCount &&
      now.getTime() - this.state.timeSinceNotificationCount.getTime() < 30000
    ) {
      return;
    }
    if (isAuthenticated) {
      this.setState({ timeSinceNotificationCount: now });
      this.props.actions.getNotificationCount();
    }
  };

  componentWillUnmount() {
    window.removeEventListener('focus', getNotificationCount);
  }

  toggleLogin = () => {
    const { location, history } = this.props;
    history.push({
      search: `?redirect=${location.pathname}`
    });
    this.props.actions.showModal('login');
  };

  closeModal() {
    this.props.history.push(this.props.location.pathname);
  }

  render() {
    const { auth, actions, notif, screenSize, title } = this.props;
    return (
      <Nav
        fdirection="column"
        justify="center"
        p={['0 4', '0 2']}
        top={notif.promptType ? layout.BANNER_PROMPT_HEIGHT : null}
      >
        <View
          zIndex={1}
          justify="space-between"
          display="flex"
          fdirection="row"
          align="center"
        >
          <MenuIcon mr={[4, 2]} />
          {title ? <Header>{title}</Header> : <DiscoverTabs />}
          <View
            justify="space-between"
            display="flex"
            fdirection="row"
            flex={1}
            grow={1}
            align="center"
          >
            {!title && auth.isAuthenticated ? (
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
              {screenSize ? null : (
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
              )}
              {auth.isAuthenticated ? (
                <Link
                  onClick={() => actions.showModal('newpost')}
                  to={'#'}
                  disabled={!auth.user}
                >
                  <ActionButton screenSize={screenSize}>New Post</ActionButton>
                </Link>
              ) : (
                <ActionButton
                  screenSize={screenSize}
                  onClick={this.toggleLogin}
                  color={colors.blue}
                >
                  Login
                </ActionButton>
              )}
            </View>
          </View>
        </View>
        <View fdirection={'row'} mt={[0, 1]} ml={[0, 5.5]}>
          <Breadcrumbs />
        </View>
      </Nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif,
    screenSize: state.navigation.screenSize
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
