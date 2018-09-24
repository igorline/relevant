import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drizzle } from 'drizzle';
// import { DrizzleProvider, drizzleConnect } from 'drizzle-react';
import Header from './common/header.component';
import AppHeader from './common/appHeader.component';
import * as routerActions from 'react-router-redux';
import * as navigationActions from '../../actions/navigation.actions';
import { Link } from 'react-router';

// import Footer from './common/footer.component';
import * as authActions from '../../actions/auth.actions';
import RelevantCoin from '../../contracts/RelevantCoin.json';
import AddEthAddress from './wallet/AddEthAddress';
import LoginModal from './auth/loginModal.component';
import AuthContainer from './auth/auth.container';
import Sidebar from './common/sidebar.component';
import EthTools from './ethTools/tools.container';
import Modal from './common/modal';
import CreatePost from './createPost/createPost.container';
import Eth from './ethTools/eth.context';
import CommunityNav from './community/communityNav.component';

if (process.env.BROWSER === true) {
  console.log('BROWSER, import css');
  require('./index.css');
  require('./fonts.css');
  require('./splash/splash.css');
}

let options = {
  contracts: [
    RelevantCoin
  ],
  events: {},
  polls: {
    blocks: 300,
    accounts: 300,
  },
  networkId: 4,
  web3: {
    useMetamask: true,
    block: false,
    fallback: {
      type: 'ws',
      url: 'wss://rinkeby.infura.io/_ws'
    }
  }
};

const ThemeContext = React.createContext('light');

class App extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  state = {
    openLoginModal: false
  }

  componentWillMount() {
    let community = this.props.params.community;
    this.props.actions.setCommunity(community);
  }

  componentDidMount() {
    // document.body.classList.remove('loading')
    this.props.actions.getUser();
    new Drizzle(options, this.context.store);

    // this will be harsh...
    // window.addEventListener('focus', () => {
    //   if (this.props.newPosts)
    //   this.props.actions.refreshTab('discover');
    // });
  }

  componentDidUpdate(prevProps) {
    let community = this.props.params.community;
    if (community && this.props.auth.community !== community) {
      console.log('auth community ', this.props.auth.community);
      console.log('community ', community);

      this.props.actions.setCommunity(community);
    };

    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
    let userId = this.props.auth.user ? this.props.auth.user._id : null;
    let PrevUserId = prevProps.auth.user ? prevProps.auth.user._id : null;

    if (userId !== PrevUserId) {
      this.props.actions.userToSocket(userId);
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
            <img
              alt="iOS App Store"
              src="https://relevant.community/img/appstore.png"
            />
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

    let header =
      <AppHeader
        location={location}
        params={this.props.params}
        toggleLogin={this.toggleLogin.bind(this)}
      />;
    if (location.pathname === '/') {
      header = <Header
        params={this.props.params}
        toggleLogin={this.toggleLogin.bind(this)}
      />;
      mobileEl = null;
    }

    let user = this.props.user;
    let temp = user && user.role === 'temp';
    const create = location.hash === '#newpost';
    const connectAccount = location.hash === '#connectAccount';

    return (
      <main>

        <EthTools>
          {header}
          <div style={{ display: 'flex', width: '100%' }}>
            <CommunityNav {...this.props} />
            {this.props.children}
          </div>
          <AuthContainer
            toggleLogin={this.toggleLogin.bind(this)}
            open={this.state.openLoginModal || temp}
            modal
            {...this.props}
          />
          <Eth.Consumer>
            {wallet => <AddEthAddress
              connectAccount={connectAccount}
              closeModal={this.closeModal.bind(this)}
              {...this.props}
              {...wallet}
            />}
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
  actions: bindActionCreators({
    ...navigationActions,
    ...routerActions,
    ...authActions,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
