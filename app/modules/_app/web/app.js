import React, { Component } from 'react';
import PropTypes from 'prop-types';

import routes from 'modules/_app/web/routes';
import queryString from 'query-string';
import get from 'lodash/get';

import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';
import * as modals from 'modules/ui/modals';

import { renderRoutes, matchRoutes } from 'react-router-config';
import { getCommunities } from 'modules/community/community.actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { getEarnings } from 'modules/wallet/earnings.actions';

import AuthContainer from 'modules/auth/web/auth.container';
import AddEthAddress from 'modules/wallet/web/AddEthAddress';
import Modal from 'modules/ui/web/modal';
import EthTools from 'modules/web_ethTools/tools.container';
import Eth from 'modules/web_ethTools/eth.context';
import UpvoteAnimation from 'modules/animation/mobile/upvoteAnimation.component';

import { ToastContainer } from 'react-toastify';
import { GlobalStyle } from 'app/styles';
import { TextTooltip, CustomTooltip } from 'modules/tooltip/web/tooltip.component';
import { BANNED_COMMUNITY_SLUGS } from 'server/config/globalConstants';

if (process.env.BROWSER === true) {
  require('app/styles/index.css');
  require('app/styles/fonts.css');
  require('modules/web_splash/splash.css');
  require('react-toastify/dist/ReactToastify.css');
}

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
    const { actions, auth, location, history } = this.props;
    const { community } = auth;

    if (community && location.pathname === '/') {
      history.replace(`/${community}/new`);
    }

    if (community) actions.setCommunity(community);
    actions.getCommunities();
    actions.getUser();
    actions.getEarnings('pending');

    if (auth.user && auth.user.webOnboard && !auth.user.webOnboard.onboarding) {
      actions.showModal('onboarding');
      actions.webOnboard('onboarding');
    }

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

    // TODO do this after a timeout
    window.addEventListener('blur', () => {
      this.backgroundTime = new Date().getTime();
    });

    // TODO do this after a timeout
    window.addEventListener('focus', () => this.reloadTabs());
  }

  reloadTabs = () => {
    const now = new Date().getTime();
    if (now - this.backgroundTime > 10 * 60 * 1000) {
      this.props.actions.reloadAllTabs();
    }
  };

  handleUserLogin = () => {
    const { auth, actions } = this.props;
    if (!auth.user.webOnboard.onboarding) {
      actions.showModal('onboarding');
      actions.webOnboard('onboarding');
    }
    if (auth.invitecode) {
      actions.redeemInvite(auth.invitecode);
    }
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
    // const match = matchPath(history.location.pathname, {
    //   // You can share this string as a constant if you want
    //   path: "/articles/:id"
    // });
  }

  toggleLogin(authType) {
    this.setState({ openLoginModal: !this.state.openLoginModal, authType });
  }

  closeModal() {
    this.props.history.push(this.props.location.pathname);
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
    const { location, user, children } = this.props;
    const temp = user && user.role === 'temp';
    const connectAccount = location.hash === '#connectAccount';

    const mobileEl = (
      <div className="mobileSplash">
        <h1>Relevant browser version doesn't currently support mobile devices</h1>
        <p>Please download a dedicated mobile app:</p>
        <p>
          <a
            href="https://itunes.apple.com/us/app/relevant-a-social-news-reader/id1173025051?mt=8"
            target="_blank"
          >
            <img alt="iOS App Store" src="https://relevant.community/img/appstore.png" />
          </a>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <a
            href="https://play.google.com/store/apps/details?id=com.relevantnative&amp;pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
            target="_blank"
          >
            <img
              alt="Google Play Store"
              src="https://relevant.community/img/googleplaystore.png"
            />
          </a>
        </p>
      </div>
    );

    return (
      <div>
        <GlobalStyle />
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
        <EthTools>
          <div style={{ display: 'flex', width: '100%' }}>{children}</div>
          <AuthContainer
            toggleLogin={this.toggleLogin.bind(this)}
            open={this.state.openLoginModal || temp}
            modal
            type={this.state.authType}
            {...this.props}
          />
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
        </EthTools>
        {this.renderModal()}
        <ToastContainer />
        {renderRoutes(this.props.route.routes)}
        <span>{mobileEl}</span>
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
