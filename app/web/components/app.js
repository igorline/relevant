import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drizzle } from 'drizzle';
import * as routerActions from 'react-router-redux';
import Header from './common/header.component';
import AppHeader from './common/appHeader.component';
import * as navigationActions from '../../actions/navigation.actions';
import * as authActions from '../../actions/auth.actions';
import RelevantCoin from '../../contracts/RelevantCoin.json';
import AddEthAddress from './wallet/AddEthAddress';
import AuthContainer from './auth/auth.container';
// import Sidebar from './common/sidebar.component';
import EthTools from './ethTools/tools.container';
import Modal from './common/modal';
import CreatePost from './createPost/createPost.container';
import Eth from './ethTools/eth.context';
// import CommunityNav from './community/communityNav.component';

if (process.env.BROWSER === true) {
  require('./index.css');
  require('./fonts.css');
  require('./splash/splash.css');
}

const networkId = 4;

const options = {
  contracts: [RelevantCoin],
  events: {},
  polls: {
    blocks: 100,
    accounts: 300
  },
  networkId,
  web3: {
    ignoreMetamask: true,
    useMetamask: true,
    fallback: global.web3
      ? null
      : {
        type: 'https',
        // TODO ENV?
        url: 'https://rinkeby.infura.io/eAeL7I8caPNjDe66XRTq',
        // type: 'ws',
        // url: 'ws://rinkeby.infura.io/_ws',
        networkId: 4
      }
  }
};
let drizzle;

class App extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object,
    params: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    children: PropTypes.node
  };

  static contextTypes = {
    store: PropTypes.object
  };

  state = {
    openLoginModal: false
  };

  componentWillMount() {
    const community = this.props.auth.community;
    if (community && community !== 'home') {
      this.props.actions.setCommunity(community);
    }
  }

  componentDidMount() {
    const community = this.props.auth.community;
    const { isAuthenticated } = this.props.auth;

    this.props.actions.setCommunity(community);

    this.props.actions.getUser();

    if (isAuthenticated) {
      // eslint-disable-next-line
      drizzle = new Drizzle(options, this.context.store);
    }

    // TODO do this after a timeout
    // window.addEventListener('focus', () => {
    //   if (this.props.newPosts)
    //   this.props.actions.refreshTab('discover');
    // });
  }

  componentDidUpdate(prevProps) {
    const { community } = this.props.params;
    const { isAuthenticated } = this.props.auth;
    if (community && this.props.auth.community !== community) {
      if (community === 'home') prevProps.actions.push(`/${this.props.auth.community}/new`);
      else this.props.actions.setCommunity(community);
    }

    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }

    const userId = this.props.auth.user ? this.props.auth.user._id : null;
    const PrevUserId = prevProps.auth.user ? prevProps.auth.user._id : null;

    if (userId !== PrevUserId) {
      this.props.actions.userToSocket(userId);
    }

    if (isAuthenticated && !prevProps.auth.isAuthenticated && !drizzle) {
      drizzle = new Drizzle(options, this.context.store);
    }
  }

  toggleLogin() {
    this.setState({ openLoginModal: !this.state.openLoginModal });
  }

  closeModal() {
    this.props.actions.push(this.props.location.pathname);
  }

  render() {
    const location = this.props.location;

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
            <img alt="Google Play Store" src="https://relevant.community/img/googleplaystore.png" />
          </a>
        </p>
      </div>
    );

    let header = (
      <AppHeader
        location={location}
        params={this.props.params}
        toggleLogin={this.toggleLogin.bind(this)}
      />
    );
    if (location.pathname === '/') {
      header = <Header params={this.props.params} toggleLogin={this.toggleLogin.bind(this)} />;
      mobileEl = null;
    }

    const user = this.props.user;
    const temp = user && user.role === 'temp';
    const create = location.hash === '#newpost';
    const connectAccount = location.hash === '#connectAccount';

    return (
      <main>
        <EthTools>
          {header}
          <div style={{ display: 'flex', width: '100%' }}>
            {/* <CommunityNav {...this.props} /> */}
            {this.props.children}
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
          close={() => this.props.actions.push(location.pathname)}
        >
          <CreatePost modal />
        </Modal>
        {mobileEl}
      </main>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...navigationActions,
      ...routerActions,
      ...authActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
