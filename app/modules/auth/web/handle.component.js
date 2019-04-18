import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import { View, Button } from 'modules/styled/uni';
import FormField from 'modules/styled/form/field.component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loginUser, checkUser, createUser } from 'modules/auth/auth.actions';
// import { updateHandle } from 'modules/auth/user.actions';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';

class LoginForm extends Component {
  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.object,
    checkUser: PropTypes.func,
    nameError: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    const { user, actions } = this.props;
    const updatedUser = { ...user };
    if (!this.state.username) {
      browserAlerts.alert('username requied');
      return;
    }
    updatedUser.handle = this.state.username;
    this.state.email ? (updatedUser.email = this.state.email) : null;
    actions.updateHandle(updatedUser);
  }

  render() {
    const { user } = this.props;
    return (
      <View>
        <FormField
          type="text"
          placeholder="Username"
          label="Choose your handle:"
          value={'@' + this.state.username}
          onChange={e => {
            const username = e.target.value.trim().replace('@', '');
            this.props.checkUser(username.trim());
            this.handleChange('username', username);
          }}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              this.submit();
            }
          }}
          error={this.props.nameError}
        />

        {user && !user.email ? (
          <FormField
            type="email"
            placeholder="email (optional for email reset and notifications)"
            label="Add your email:"
            onChange={e => {
              const email = e.target.value.trim();
              this.handleChange('email', email);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.submit();
              }
            }}
          />
        ) : null}

        <View justify="flex-start">
          <Button onClick={this.submit} ml="auto" mt={4}>
            Finish
          </Button>
        </View>
      </View>
    );
  }
}

// export default LoginForm;

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
      // updateHandle,
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LoginForm)
);
