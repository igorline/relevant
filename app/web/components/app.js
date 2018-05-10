import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drizzle } from 'drizzle';
// import { DrizzleProvider, drizzleConnect } from 'drizzle-react';
import Header from './common/header.component';
import AppHeader from './common/appHeader.component';
import * as routerActions from 'react-router-redux';

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

  componentDidMount() {
    // document.body.classList.remove('loading')
    this.props.actions.getUser();
    new Drizzle(options, this.context.store);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
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
    ...routerActions,
    ...authActions,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
