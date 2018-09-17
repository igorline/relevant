import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Avatar from './avatar.component';
import Modal from '../common/modal';
import ShadowButton from '../common/ShadowButton';
import * as authActions from '../../../actions/auth.actions';

if (process.env.BROWSER === true) {
  require('./header.css');
}

class Header extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      modal: false
    };
    this.login = this.login.bind(this);
  }


  login() {
    let user = {
      name: this.username,
      password: this.password
    };
    // let redirect = this.props.location.query.redirect || '/login';
    this.props.actions.loginUser(user);
    this.setState({ modal: !this.state.modal });
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

  renderPostButton() {
    return <div />;
  }

  render() {

    let desktopApp = false;
    if (process.env.DEVTOOLS) {
      desktopApp = true;
    }

    return (
      <div className="headerContainer">
        <header style={{ padding: '0 30px' }}>
          {this.renderPostButton()}
          <div>
            <Link to={this.props.isAuthenticated && desktopApp ? '/home' : '/'}>
              <img src={'/img/logo-white.svg'} className={'logo'} alt={'Relevant'} />
            </Link>
          </div>
          <div className={'rightNav'}>
          {desktopApp ? this.renderLoginButton() : <div></div>}
          </div>
        </header>
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ ...authActions }, dispatch)

});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
