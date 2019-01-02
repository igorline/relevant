import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'modules/ui/web/modal';
import ShadowButton from 'modules/ui/web/ShadowButton';
import * as authActions from 'modules/auth/auth.actions';

class LoginModal extends Component {
  static propTypes = {
    actions: PropTypes.object,
    toggleLogin: PropTypes.func,
    open: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      open: false
    };
    this.renderModal = this.renderModal.bind(this);
    this.login = this.login.bind(this);
  }

  async login() {
    const { actions, toggleLogin } = this.props;
    try {
      const user = {
        name: this.state.username,
        password: this.state.password
      };
      const loggedIn = await actions.loginUser(user);
      if (loggedIn) toggleLogin();
    } catch (err) {
      console.error('error logging in ', err);
    }
  }

  renderModal() {
    const modalHeader = <p className="loginText">Log In</p>;
    const modalFooter = (
      <ShadowButton backgroundColor={'white'} color={'#3E3EFF'} onClick={this.login}>
        Login
      </ShadowButton>
    );

    return (
      <Modal
        visible={this.props.open}
        close={this.props.toggleLogin}
        title={'Sign In'}
        header={modalHeader}
        footer={modalFooter}
      >
        <input
          className="blueInput special"
          value={this.state.username}
          onChange={username => {
            this.setState({ username: username.target.value });
          }}
          type="text"
          name="username"
          placeholder="username"
        />
        <input
          className="blueInput special pass"
          value={this.state.password}
          onChange={password => {
            this.setState({ password: password.target.value });
          }}
          type="password"
          name="password"
          placeholder="password"
        />
      </Modal>
    );
  }

  render() {
    return this.renderModal();
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...authActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginModal);
