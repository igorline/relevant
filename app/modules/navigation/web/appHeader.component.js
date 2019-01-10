import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Avatar from 'modules/user/web/avatar.component';
import ShadowButton from 'modules/ui/web/ShadowButton';
import * as authActions from 'modules/auth/auth.actions';
import * as notifActions from 'modules/activity/activity.actions';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import Activity from 'modules/activity/web/activity.container';
import RequestInvite from 'modules/web_splash/requestInvite.component';
import { matchPath } from 'react-router';

if (process.env.BROWSER === true) {
  require('./header.css');
}

class AppHeader extends Component {
  static propTypes = {
    actions: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    notif: PropTypes.object,
    user: PropTypes.object,
    toggleLogin: PropTypes.func,
    location: PropTypes.object,
    auth: PropTypes.object,
    history: PropTypes.object,
  };

  state = {
    activity: false,
    wallet: false,
    timeSinceNotificationCount: 0
  };

  componentDidMount() {
    this.getNotificationCount();
    window.addEventListener('focus', () => {
      this.getNotificationCount();
    });

    window.addEventListener('click', e => {
      if (e.target.classList.contains('activityButton')) return true;
      if (this.state.activity) {
        this.setState({ activity: false });
      }
      return null;
    });
  }

  componentDidUpdate(prevProps) {
    const wasNotAuthenticated = !prevProps.auth.isAuthenticated;
    const { isAuthenticated } = this.props.auth;
    if (wasNotAuthenticated && isAuthenticated) this.getNotificationCount();
  }

  getNotificationCount() {
    const now = new Date();
    const { isAuthenticated } = this.props.auth;
    if (now - this.state.timeSinceNotificationCount < 5000) return;
    if (isAuthenticated) {
      this.props.actions.getNotificationCount();
      this.setState({ timeSinceNotificationCount: now });
    }
  }

  renderActivity() {
    if (!this.props.isAuthenticated) return null;
    const activity = this.state.activity ? (
      <Activity close={() => this.setState({ activity: false })} />
    ) : null;
    const { count } = this.props.notif;
    const badge = count ? <span className={'badge'}>{count}</span> : null;
    return (
      <div
        className={'navLink'}
        onClick={() => {
          this.setState({ activity: !this.state.activity });
          return false;
        }}
      >
        <span className="activityButton">Activity</span>
        {badge}
        {activity}
      </div>
    );
  }

  renderLoginButton() {
    if (!this.props.isAuthenticated || !this.props.user) {
      return (
        <div className={'navLink'}>
          <div onClick={this.props.toggleLogin}>Login</div>
        </div>
      );
    }

    return (
      <div className="navInner">
        <div className={'navLink profileMenuParent'}>
          <Avatar size={42} user={this.props.user} noName />
        </div>
        <div
          className={'navLink'}
          onClick={() => this.props.actions.logoutAction(this.props.user)}
        >
          Logout
        </div>
      </div>
    );
  }

  renderWallet() {
    if (!this.props.isAuthenticated) return null;
    let active = this.props.location.pathname === '/user/wallet';
    active = active ? 'active' : '';
    return (
      <Link to={'/user/wallet'} className={'navLink ' + active}>
        Wallet
      </Link>
    );
  }

  renderLeft() {
    return <div />;
  }

  renderSubHeaer() {
    const loggedIn = this.props.auth.isAuthenticated;
    let cta;

    const signup = (
      <div className="signupCTA">
        <div className="basicButton">
          <a
            target="_blank"
            href="https://hackernoon.com/relevant-an-introduction-5b79ef7afa9"
          >
            Read more about Relevant
          </a>
        </div>
        <Link to="/user/signup">
          <ShadowButton>Sign Up</ShadowButton>
        </Link>
      </div>
    );

    if (!loggedIn) {
      cta = <RequestInvite type={'app'} cta={signup} />;
    }
    return cta;
  }

  render() {
    const logoLink = this.props.isAuthenticated ? '/relevant/new' : '/';

    // TODO this is hack to make new/top nav links work
    // better way is to move this logic to the redux state
    const match = matchPath(this.props.history.location.pathname, {
      path: '/:community/:sort/:tag?',
      exact: true,
      strict: false
    });
    if (
      match &&
      (match.params.sort === 'post' ||
      match.params.community === 'user' ||
      match.params.community === 'auth' ||
      match.params.community === 'info')
    ) match.params = {};

    return (
      <div className="headerContainer appHeader">
        <header>
          <div className="headerInner row">
            <div>
              <Link to={logoLink}>
                <img src={'/img/logo.svg'} className={'logo'} alt={'Relevant'} />
              </Link>
            </div>
            <div className="tabContainer">
              <DiscoverTabs
                match={match || { params: {} } }
                location={this.props.location}
                auth={this.props.auth}
              />
            </div>

            <div className={'rightNav'}>
              {this.renderWallet()}
              {this.renderActivity()}
              {this.renderLoginButton()}
            </div>
          </div>
        </header>
        <div className={'banner'}>{this.renderSubHeaer()}</div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
  notif: state.notif
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
      ...notifActions
    },
    dispatch
  )
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppHeader));
