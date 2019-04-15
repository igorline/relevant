import React, { Component } from 'react';
import PropTypes from 'prop-types';

import loadable from '@loadable/component';

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import routes from 'modules/_app/web/routes';
import queryString from 'query-string';
import get from 'lodash.get';

import { renderRoutes, matchRoutes } from 'react-router-config';
import { getCommunities } from 'modules/community/community.actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { getEarnings } from 'modules/wallet/earnings.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';

// import AuthContainer from 'modules/auth/web/auth.container';
// import AddEthAddress from 'modules/wallet/web/AddEthAddress';
// import EthTools from 'modules/web_ethTools/tools.container';
// import Eth from 'modules/web_ethTools/eth.context';

import Modal from 'modules/ui/web/modal';

import { GlobalStyle } from 'app/styles';
import { BANNED_COMMUNITY_SLUGS } from 'server/config/globalConstants';

import SmartBanner from 'react-smartbanner';
import ReactGA from 'react-ga';

import * as modals from 'modules/ui/modals';

import { TextTooltip, CustomTooltip } from 'modules/tooltip/web/tooltip.component';
import { ToastContainer } from 'react-toastify';

// const { ToastContainer } = loadable(() => import('react-toastify'));
// const { TextTooltip, CustomTooltip } = loadable(
//  () => import('modules/tooltip/web/tooltip.component'));

const UpvoteAnimation = loadable(() =>
  import('modules/animation/mobile/upvoteAnimation.component')
);

ReactGA.initialize('UA-51795165-6');

if (process.env.BROWSER === true) {
  require('app/styles/index.css');
  require('app/styles/fonts.css');
  require('modules/web_splash/splash.css');
  require('react-toastify/dist/ReactToastify.css');
  require('react-smartbanner/dist/main.css');
  // require('app/utils/notifications');
}

// function displayNotification() {
//   if (Notification.permission === 'granted') {
//     navigator.serviceWorker.getRegistration().then(function(reg) {
//       const options = {
//         body: 'Here is a notification body!',
//         icon: 'images/example.png',
//         vibrate: [100, 50, 100],
//         data: {
//           dateOfArrival: Date.now(),
//           primaryKey: 1
//         }
//       };
//       reg.showNotification('Hello world!', options);
//     });
//   }
// }

class App extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object,
    match: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    children: PropTypes.node,
    history: PropTypes.object,
    route: PropTypes.object,
    activeCommunity: PropTypes.string,
    globalModal: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  };

  state = {
    openLoginModal: false,
    authType: null
  };

  componentWillMount() {
    const { actions } = this.props;
    const { community } = this.props.auth;
    actions.setCommunity(community || 'relevant');
  }

  componentDidMount() {
    // displayNotification();
    const { actions, auth, location, history } = this.props;
    const { community } = auth;

    if (community && location.pathname === '/') {
      history.replace(`/${community}/new`);
    }

    if (community) actions.setCommunity(community);
    actions.getCommunities();
    actions.getUser();
    actions.getEarnings('pending');

    if (auth.user) this.handleUserLogin();

    const parsed = queryString.parse(location.search);
    if (parsed.invitecode) {
      actions.setInviteCode(parsed.invitecode);
      if (auth.isAuthenticated) {
        actions.redeemInvite(parsed.invitecode);
      } else if (!location.pathname.match('resetPassword')) {
        history.push({
          pathname: '/user/signup',
          search: `${location.search}&redirect=${location.pathname}`
        });
      }
    }
    this.updateWidth();
    window.addEventListener('resize', this.updateWidth);
    // TODO do this after a timeout
    window.addEventListener('blur', () => {
      this.backgroundTime = new Date().getTime();
    });

    // TODO do this after a timeout
    window.addEventListener('focus', () => this.reloadTabs());
    history.listen(loc => ReactGA.pageview(loc.pathname + loc.search));

    const ReactPixel = require('react-facebook-pixel').default;
    ReactPixel.init('286620198458049');
  }

  setWidth = () => {
    this.props.actions.setWidth(window.innerWidth);
  };

  debouncedSetWidth = AwesomeDebouncePromise(this.setWidth, 100);
  updateWidth = () => {
    this.debouncedSetWidth();
  };
  reloadTabs = () => {
    const now = new Date().getTime();
    if (now - this.backgroundTime > 10 * 60 * 1000) {
      this.props.actions.reloadAllTabs();
    }
  };

  handleUserLogin = () => {
    const { auth, actions } = this.props;
    if (auth.user.role === 'temp') return;
    if (!auth.user.webOnboard.onboarding) {
      actions.showModal('onboarding');
      actions.webOnboard('onboarding');
    }
    if (auth.invitecode) {
      actions.redeemInvite(auth.invitecode);
      ReactGA.event({
        category: 'User',
        action: 'Redeemed Invite'
      });
    }
    ReactGA.set({ userId: auth.user._id });
  };

  componentDidUpdate(prevProps) {
    const { actions, auth, location } = this.props;
    // const { community } = match.params;
    // if (community && activeCommunity !== community) {
    //   if (community === 'home') {
    //     this.props.history.push(`/${activeCommunity}/new`);
    //   } else actions.setCommunity(community);
    // }

    const route = matchRoutes(routes, location.pathname);
    const newCommunity = get(route, `[${route.length - 1}].match.params.community`);

    if (
      newCommunity &&
      newCommunity !== auth.community &&
      !BANNED_COMMUNITY_SLUGS.includes(newCommunity)
    ) {
      actions.setCommunity(newCommunity);
    }

    if (location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }

    const userId = auth.user ? auth.user._id : null;
    const PrevUserId = prevProps.auth.user ? prevProps.auth.user._id : null;

    if (userId !== PrevUserId) {
      actions.userToSocket(userId);
    }

    if (!prevProps.auth.user && auth.user) {
      this.handleUserLogin();
    }
    if (
      prevProps.auth.user &&
      auth.user &&
      prevProps.auth.user.role === 'temp' &&
      auth.user.role !== 'temp'
    ) {
      this.handleUserLogin();
    }
  }

  toggleLogin(authType) {
    this.setState({ openLoginModal: !this.state.openLoginModal, authType });
  }

  closeModal() {
    const { history, location } = this.props;
    const queryParams = queryString.parse(location.search);
    if (queryParams.redirect) {
      history.push(queryParams.redirect);
    } else {
      history.push(location.pathname);
    }
  }

  renderModal() {
    const { location, history } = this.props; // eslint-disable-line
    let { globalModal } = this.props;
    const { hash } = location;
    let hashModal;
    if (hash) {
      hashModal = hash.substring(1);
    }
    // if (!hash && globalModal) {
    //   history.push(location.pathname + `#${globalModal}`);
    // }
    if (hashModal) {
      globalModal = hashModal;
    }
    if (!globalModal) return null;
    globalModal = modals[globalModal] || globalModal;

    if (typeof globalModal === 'string') return null;
    const { Body } = globalModal;
    const bodyProps = globalModal.bodyProps ? globalModal.bodyProps : {};
    return (
      <Modal
        {...globalModal}
        close={() => {
          this.props.actions.hideModal();
          this.closeModal();
        }}
        visible
      >
        <Body
          {...bodyProps}
          close={() => {
            this.props.actions.hideModal();
            this.closeModal();
          }}
        />
      </Modal>
    );
  }

  render() {
    // const { location, user } = this.props;
    // const temp = user && user.role === 'temp';
    // const connectAccount = location.hash === '#connectAccount';

    return (
      <div>
        <GlobalStyle />
        <SmartBanner
          daysHidden={0}
          daysReminder={0}
          title={'Relevant Communities'}
          // author={''}
          position={'top'}
          // force={'ios'}
        />
        <TextTooltip
          type={'dark'}
          scrollHide
          id="mainTooltip"
          multiline
          ref={c => (this.tooltip = c)}
        />
        <CustomTooltip id="tooltip" multiline ref={c => (this.tooltip = c)} />

        <div
          pointerEvents={'none'}
          style={{
            top: '0',
            left: '0',
            zIndex: '10000'
          }}
        >
          <UpvoteAnimation />
        </div>

        {/* <AuthContainer
          toggleLogin={this.toggleLogin.bind(this)}
          open={this.state.openLoginModal || temp}
          modal
          type={this.state.authType}
          {...this.props}
        /> */}

        {/* TODO - separate modal
        <EthTools>
          <div style={{ display: 'flex', width: '100%' }}>{children}</div>
          <Eth.Consumer>
            {wallet => (
              <AddEthAddress
                connectAccount={connectAccount}
                closeModal={this.closeModal.bind(this)}
                {...this.props}
                {...wallet}
              />
            )}
          </Eth.Consumer>
        </EthTools> */}
        {this.renderModal()}
        <ToastContainer />
        {renderRoutes(this.props.route.routes)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth,
  activeCommunity: state.community.active,
  navigation: state.navigation,
  globalModal: state.navigation.modal
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...navigationActions,
      ...authActions,
      getCommunities,
      getEarnings
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
