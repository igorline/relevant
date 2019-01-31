import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from 'modules/user/web/avatar.component';
import * as authActions from 'modules/auth/auth.actions';

if (process.env.BROWSER === true) {
  require('./header.css');
}

class Header extends Component {
  static propTypes = {
    actions: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    user: PropTypes.object,
    toggleLogin: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      modal: false
    };
    this.login = this.login.bind(this);
  }

  login() {
    const user = {
      name: this.username,
      password: this.password
    };
    this.props.actions.loginUser(user);
    this.setState({ modal: !this.state.modal });
  }

  renderBlog() {
    return (
      <div className="navInner">
        <a
          className={'navLink'}
          href="https://blog.relevant.community"
        >
          Blog
        </a>
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
        <div className={'navLink'}>
          <Avatar size={42} user={this.props.user} noName />
        </div>
        <div className={'navLink'} onClick={() => this.props.actions.logoutAction(this.props.user)}>
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
          {this.renderBlog()}
          <div>
            <Link to={this.props.isAuthenticated && desktopApp ? '/relevant' : '/'}>
              <img src={'/img/logo-white.svg'} className={'logo'} alt={'Relevant'} />
            </Link>
          </div>
          <div className={'rightNav'}>{desktopApp ? this.renderLoginButton() : <div />}</div>
        </header>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...authActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
