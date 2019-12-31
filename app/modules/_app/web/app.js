import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import loadable from '@loadable/component';

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import routes from 'modules/_app/web/routes'; // eslint-disable-line
import queryString from 'query-string';
import get from 'lodash/get';
import { renderRoutes, matchRoutes } from 'react-router-config';
import { getCommunities } from 'modules/community/community.actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { getEarnings } from 'modules/wallet/earnings.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';
import ModalContainer from 'modules/ui/modals/modal.container';
import { GlobalStyle } from 'app/styles';
import { BANNED_COMMUNITY_SLUGS } from 'server/config/globalConstants';
import SmartBanner from 'react-smartbanner';
import ReactGA from 'react-ga';
import { TwitterCT } from 'app/utils/social';
import { TextTooltip } from 'modules/tooltip/web/tooltip.component';
import { ToastContainer } from 'react-toastify';
import { ContractProvider } from 'modules/contract/contract.provider';
import styled from 'styled-components';

const PriceProvider = loadable(() => import('modules/wallet/price.context'));

const UpvoteAnimation = loadable(() =>
  import('modules/animation/upvoteAnimation.component')
);
const DownvoteAnimation = loadable(() =>
  import('modules/animation/downvoteAnimation.component')
);

const AnimationContainer = styled.div`
  pointer-events: none;
  top: '0',
  left: '0',
  zIndex: '10000'
`;

// const DEV_MODE = process.env.NODE_ENV === 'development';

if (process.env.BROWSER === true) {
  require('app/styles/index.css');
  require('app/styles/fonts.css');
  require('react-toastify/dist/ReactToastify.css');
  require('react-smartbanner/dist/main.css');
}

class App extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object,
    match: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    history: PropTypes.object,
    route: PropTypes.object,
    globalModal: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    const { history } = props;
    history.listen(loc => this.updateCommunity(loc));
  }

  state = {
    authType: null
  };

  componentDidMount() {
    const { actions, auth, location, history } = this.props;

    if (process.env.NODE_ENV !== 'development') {
      this.initAnalytics({ location, history });
    }

    // actions.getCommunities();
    actions.getUser();

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
  }

  updateCommunity(location) {
    const { actions, auth } = this.props;

    const route = matchRoutes(routes, location.pathname);
    const newCommunity = get(route, `[${route.length - 1}].match.params.community`);

    if (
      newCommunity &&
      newCommunity !== auth.community &&
      !BANNED_COMMUNITY_SLUGS.includes(newCommunity)
    ) {
      actions.setCommunity(newCommunity);
    }
  }

  initAnalytics = ({ location, history }) => {
    TwitterCT.init('o1p7u');
    ReactGA.initialize('UA-51795165-6');

    TwitterCT.pageView();
    ReactGA.pageview(location.pathname + location.search);

    history.listen(loc => {
      TwitterCT.pageView();
      ReactGA.pageview(loc.pathname + loc.search);
    });
  };

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
    const { auth, actions, navigation, location, history } = this.props;
    const { screenSize } = navigation;

    if (auth.user.role === 'temp') {
      return actions.showModal('setHandle');
    }
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
    actions.getEarnings('pending');

    if (!auth.community && location.pathname === '/') {
      history.replace('/communities');
    }

    if (screenSize) return null;
    return null;
  };

  componentDidUpdate(prevProps) {
    const { actions, auth, location } = this.props;

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

  render() {
    const { globalModal, navigation } = this.props;
    const { screenSize } = navigation;
    return (
      <div>
        <GlobalStyle />
        <SmartBanner
          daysHidden={0}
          daysReminder={0}
          title={'Relevant Communities'}
          position={'top'}
          // force={'ios'}
        />
        <TextTooltip
          globalEventOff="click"
          type={'dark'}
          scrollHide
          id="mainTooltip"
          multiline
        />
        {/*        <CustomTooltip id="tooltip" multiline />
         */}
        <AnimationContainer>
          <UpvoteAnimation />
          <DownvoteAnimation />
        </AnimationContainer>

        <ContractProvider>
          <PriceProvider>
            <Fragment>
              <ModalContainer />
              <ToastContainer />
              <div style={globalModal && !screenSize ? { filter: 'blur(2px)' } : {}}>
                {renderRoutes(this.props.route.routes)}
              </div>
            </Fragment>
          </PriceProvider>
        </ContractProvider>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth,
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
