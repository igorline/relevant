import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from '../common/modal';
import ShadowButton from '../common/ShadowButton';
import * as authActions from '../../../actions/auth.actions';


class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      open: false,
    };
    this.renderModal = this.renderModal.bind(this);
    this.login = this.login.bind(this);
  }

  async login() {
    try {
      let user = {
        name: this.state.username,
        password: this.state.password
      };
      let loggedIn = await this.props.actions.loginUser(user);
      if (loggedIn) this.props.toggleLogin();
    } catch (err) {
      console.log('error logging in ', err);
    }
  }

  renderModal() {
    let modalHeader = <p className="loginText">Log In</p>;
    let modalFooter = (
      <ShadowButton
        backgroundColor={'white'}
        color={'#3E3EFF'}
        onClick={this.login}
      >
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
          onChange={(username) => {
            this.setState({ username: username.target.value });
          }}
          type="text"
          name="username"
          placeholder="username"
        />
        <input
          className="blueInput special pass"
          value={this.state.password}
          onChange={(password) => {
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

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ ...authActions }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
