import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, LinkFont, View } from 'modules/styled/uni';
import { colors } from 'app/styles';
import FormField from 'modules/styled/form/field.component';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';
import { forgotPassword } from 'modules/auth/auth.actions';

class Forgot extends Component {
  static propTypes = {
    actions: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      sentEmailTo: null
    };
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  async sendEmail() {
    const redirect = this.props.location.search;
    const res = await this.props.actions.forgotPassword(this.state.username, redirect);
    if (res && res.email) {
      this.setState({ sentEmailTo: res.email });
    }
  }

  render() {
    let content;

    if (this.state.sentEmailTo) {
      content = (
        <LinkFont c={colors.black}>
          We have set an email to {this.state.sentEmailTo} with a link to reset your
          password.{'\n'}
          If you don't see a password reset email in your inbox, please check your spam
          folder.
        </LinkFont>
      );
    } else {
      content = (
        <View>
          <FormField
            type="text"
            value={this.state.username}
            onChange={username => {
              this.handleChange('username', username.target.value);
            }}
            placeholder="Username or Email"
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.sendEmail();
              }
            }}
          />
          <View display="flex" fdirection="row" align="center" mt={7} justify="flex-end">
            <LinkFont shrink={1}>
              Back to <a onClick={() => this.props.actions.showModal('login')}>Sign in</a>
            </LinkFont>
            <Button onClick={() => this.sendEmail()} m={0} ml={2}>
              Send Recovery Email
            </Button>
          </View>
        </View>
      );
    }

    return content;
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      showModal,
      forgotPassword
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Forgot)
);
