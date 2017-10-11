import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Avatar from './avatar.component';
import Modal from '../common/modal';
import ShadowButton from '../common/ShadowButton';
import * as authActions from '../../../actions/auth.actions';
import { Link } from 'react-router';

if (process.env.BROWSER === true) {
  require('./header.css');
}

class Header extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      modal: false
    };
    this.renderModal = this.renderModal.bind(this);
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

  renderModal() {
    return (
      <Modal
        visible={this.state.modal}
        close={() => this.setState({ modal: false })}
        title={'login'}
      >
        <p className="loginText">{this.props.title}</p>
        <input
          className="blueInput special"
          value={this.username}
          onChange={(username) => {
            this.username = username.target.value;
          }}
          type="text"
          name="username"
          placeholder="username"
        />
        <input
          className="blueInput special pass"
          value={this.password}
          onChange={(password) => {
            this.password = password.target.value;
          }}
          type="password"
          name="password"
          placeholder="password"
        />
        <ShadowButton
          backgroundColor={'white'}
          color={'#3E3EFF'}
          onClick={this.login}
        >
          Login
        </ShadowButton>
      </Modal>
    );
  }

  renderLoginButton() {
    if (this.props.user) {
      return (
        <div className={'right'}>
          <a onClick={() => this.props.actions.logoutAction()} >Logout</a>
          <Avatar user={this.props.user} />
        </div>
      );
    } else {
      return (
        <div className={'right'}>
          <a onClick={() => this.setState({ modal: true })} >Login</a>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="headerContainer">
        <header>
          <div></div>
          <div>
            <Link to={this.props.isAuthenticated ? '/home' : '/'}>
              <img src={'/img/logo-white.svg'} className={'logo'} alt={'Relevant'} />
            </Link>
          </div>
          {this.renderLoginButton()}
          {this.renderModal()}
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
