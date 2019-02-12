import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import Header from 'modules/navigation/web/header.component';
import AuthContainer from 'modules/auth/web/auth.container';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';
import { getEarnings } from 'modules/wallet/earnings.actions';
import { getCommunities } from 'modules/community/community.actions';
import AddEthAddress from 'modules/wallet/web/AddEthAddress';
import Modal from 'modules/ui/web/modal';
import CreatePost from 'modules/createPost/createPost.container';
import EthTools from 'modules/web_ethTools/tools.container';
import Eth from 'modules/web_ethTools/eth.context';
import { ToastContainer } from 'react-toastify';
import { GlobalStyle } from 'app/styles';
import * as modals from 'modules/ui/modals';

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
    openLoginModal: false
  };

  componentWillMount() {
    const { community } = this.props.auth;
    if (community && community !== 'home') {
      this.props.actions.setCommunity(community);
    }
  }

  componentDidMount() {
    const { actions, auth } = this.props;
    const { community } = auth;

    actions.setCommunity(community);
    actions.getCommunities();
    actions.getUser();
    actions.getEarnings('pending');

    if (auth.user && !auth.user.webOnboard.onboarding) {
      actions.showModal('onboarding');
      actions.webOnboard('onboarding');
    }
    // TODO do this after a timeout
    // window.addEventListener('focus', () => {
    //   if (this.props.newPosts)
    //   this.props.actions.refreshTab('discover');
    // });
  }

  componentDidUpdate(prevProps) {
    const { actions, auth, location, match, activeCommunity } = this.props;
    const { community } = match.params;
    if (community && activeCommunity !== community) {
      if (community === 'home') {
        this.props.history.push(`/${activeCommunity}/new`);
      } else actions.setCommunity(community);
    }

    if (location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }

    const userId = auth.user ? auth.user._id : null;
    const PrevUserId = prevProps.auth.user ? prevProps.auth.user._id : null;

    if (userId !== PrevUserId) {
      actions.userToSocket(userId);
    }

    if (!prevProps.auth.user && auth.user && !auth.user.webOnboard.onboarding) {
      actions.showModal('onboarding');
      actions.webOnboard('onboarding');
    }
  }

  toggleLogin() {
    this.setState({ openLoginModal: !this.state.openLoginModal });
  }

  closeModal() {
    this.props.history.push(this.props.location.pathname);
  }

  renderModal() {
    let { globalModal } = this.props;
    if (!globalModal) return null;
    globalModal = modals[globalModal] || globalModal;
    return (
      <Modal
        title={globalModal.title}
        header={globalModal.header}
        footer={globalModal.footer}
        close={() => this.props.actions.hideModal()}
        visible
      >
        {globalModal.body}
      </Modal>
    );
  }

  render() {
    const { location, user, match, children } = this.props;
    const temp = user && user.role === 'temp';
    const create = location.hash === '#newpost';
    const connectAccount = location.hash === '#connectAccount';

    let mobileEl = (
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

    let header;
    if (location.pathname === '/') {
      header = <Header match={match} toggleLogin={this.toggleLogin.bind(this)} />;
      mobileEl = null;
    }

    return (
      <div>
        <GlobalStyle />
        <EthTools>
          {header}
          <div style={{ display: 'flex', width: '100%' }}>
            {/* <CommunityNav {...this.props} /> */}
            {children}
          </div>
          <AuthContainer
            toggleLogin={this.toggleLogin.bind(this)}
            open={this.state.openLoginModal || temp}
            modal
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
        <Modal
          title="New Post"
          visible={create}
          className="createPostModal"
          close={() => this.props.history.push(location.pathname)}
        >
          <CreatePost modal />
        </Modal>
        {this.renderModal()}
        <ToastContainer />
        {mobileEl}
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
