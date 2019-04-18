import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetHandle from 'modules/auth/web/handle.component';
import SignupEmail from 'modules/auth/web/signupEmail';
import SignupSocial from 'modules/auth/web/signupSocial';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loginUser, checkUser, createUser } from 'modules/auth/auth.actions';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';

class SignupForm extends Component {
  static propTypes = {
    location: PropTypes.object,
    actions: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      provider: 'twitter'
    };
  }

  render() {
    const { provider } = this.state;
    if (this.props.user && this.props.user.role === 'temp') {
      return (
        <SetHandle
          checkUser={this.checkUser}
          nameError={this.nameError}
          user={this.props.user}
          {...this.props}
        />
      );
    }
    if (provider === 'twitter') {
      return <SignupSocial />;
    }
    if (provider === 'email') {
      return <SignupEmail />;
    }
    return null;
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      loginUser,
      showModal,
      checkUser,
      createUser
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SignupForm)
);
