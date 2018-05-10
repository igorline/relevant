import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Avatar from './avatar.component';
import ShadowButton from '../common/ShadowButton';
import * as authActions from '../../../actions/auth.actions';
import * as notifActions from '../../../actions/notif.actions';
import DiscoverTabs from '../discover/discoverTabs.component';
import Activity from '../activity/activity.container';
import RequestInvite from '../splash/requestInvite.component';

if (process.env.BROWSER === true) {
  require('./header.css');
}

class AppHeader extends Component {
  state = {
    activity: false,
    wallet: false
  }

  componentDidMount() {
    this.props.actions.getNotificationCount();
    window.addEventListener('focus', () => {
      this.props.actions.getNotificationCount();
    });
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('activityButton')) return true;
      if (this.state.activity) {
        this.setState({ activity: false });
      }
    });
  }

  renderActivity() {
    if (!this.props.isAuthenticated) return null;
    let activity = this.state.activity ?
      <Activity close={() => this.setState({ activity: false })} /> :
      null;
    let count = this.props.notif.count;
    let badge = count ? <span className={'badge'}>{count}</span> : null;
    return (
      <div
        className={'navLink activityButton'}
        onClick={(e) => {
          this.setState({ activity: !this.state.activity });
          return false;
        }}
      >
        <span>Activity</span>
        {badge}
        {activity}
      </div>
    );
  }

  renderLoginButton() {
    if (!this.props.isAuthenticated || !this.props.user) return (
      <div className={'navLink'}>
        <div onClick={this.props.toggleLogin}>Login</div>
      </div>
    );

    return (<div className="navInner">
      <div className={'navLink'}>
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
    let active = this.props.location.pathname === '/wallet';
    active = active ? 'active' : '';
    return (
      <Link
        to={'/wallet'}
        className={'navLink ' + active}
      >
        Wallet
      </Link>
    );
  }

  renderLeft() {
    return <div />;
  }

  renderSubHeaer() {
    let loggedIn = this.props.auth.isAuthenticated;
    let cta;

    let signup = (
      <div className="signupCTA">
        <div className="basicButton">
          <a target="_blank" href='https://hackernoon.com/relevant-an-introduction-5b79ef7afa9'>
            Read more about Relevant
          </a>
        </div>
        <Link to="/signup">
          <ShadowButton>
            Sign Up
          </ShadowButton>
        </Link>
      </div>
    );

    if (!loggedIn) {
      cta = <RequestInvite type={'app'} cta={signup} />;
    }
    return cta;
  }

  render() {
    let desktopApp = false;
    if (process.env.DEVTOOLS) {
      desktopApp = true;
    }

    return (
      <div className="headerContainer appHeader">
        <header>
          <div className="headerInner row">
            <div>
              <Link to={this.props.isAuthenticated && desktopApp ? '/discover/new' : '/'}>
                <img src={'/img/logo.svg'} className={'logo'} alt={'Relevant'} />
              </Link>
            </div>
{/*            <h3>#{this.props.auth.community}</h3>
*/}
            <div className="tabContainer">
              <DiscoverTabs params={this.props.params} />
            </div>

            <div className={'rightNav'}>
              {this.renderWallet()}
              {this.renderActivity()}
              {this.renderLoginButton()}
            </div>
          </div>
        </header>
        <div className={'banner'}>
          {this.renderSubHeaer()}
        </div>
{/*        <div className="subHeader">
          Welcome to Relevant!
          <Link to="/signup">
            <ShadowButton
            >
              Sign Up
            </ShadowButton>
          </Link>
        </div>*/}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
  notif: state.notif,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...authActions,
    ...notifActions
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
