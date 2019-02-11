import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, LinkFont, View, Image } from 'modules/styled/uni';
import FormField from 'modules/styled/form/field.component';
import ShadowButton from 'modules/ui/web/ShadowButton';
import { browserAlerts } from 'app/utils/alert';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';

const twitterIcon = '/img/icons/twitter_white.png';

class LoginForm extends Component {
  static propTypes = {
    parentFunction: PropTypes.func,
    authNav: PropTypes.func,
    location: PropTypes.object
  };

  constructor(props) {
    super(props);
    // this.validate = this.validate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      username: '',
      password: ''
    };
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    if (!this.state.username) {
      browserAlerts.alert('username requied');
      return;
    }
    if (!this.state.password) {
      browserAlerts.alert('password required');
      return;
    }
    this.props.parentFunction(this.state);
  }

  render() {
    const { username, password } = this.state;
    const local = username.length && password.length;
    const FORM_FIELDS = [
      {
        placeholder: 'Username or email',
        label: 'Username or email',
        value: this.state.username,
        key: 'Username',
        name: 'Username',
        onChange: e => {
          this.setState({ username: e.target.value });
        },
        type: 'text'
      },
      {
        key: 'Password',
        type: 'password',
        placeholder: 'Password',
        label: 'Password',
        value: this.state.password,
        onChange: Password => {
          this.handleChange('Password', Password.target.value);
        },
        onKeyDown: e => {
          if (e.keyCode === 13) {
            this.submit();
          }
        }
      }
    ];
    return (
      <div>
        {FORM_FIELDS.map(field => (
          <FormField {...field} />
        ))}
        <View display="flex" fdirection="row" align="center" justify="flex-start">
          <a onClick={() => this.props.authNav('forgot')}>
            <LinkFont c={colors.blue} mt={2}>
              Forgot Your Password?
            </LinkFont>
          </a>
        </View>
        {!local ? (
          <View display="flex" fdirection="column" mt={6} justify="flex-start" shrink={1}>
            <ULink to={`/auth/twitter?redirect=${this.props.location.pathname}`}>
              <Button bg={colors.twitterBlue}>
                <Image source={twitterIcon} w={2} h={2} mr={2} />
                Sign In with Twitter
              </Button>
            </ULink>
          </View>
        ) : null}

        {local ? <Button onClick={this.submit}> Sign In </Button> : null}
        <div style={{ width: '100%', visibility: local ? 'visible' : 'hidden' }}>
          <ShadowButton onClick={this.submit}>Sign In</ShadowButton>
        </div>

        <LinkFont>
          Not registered yet? <a onClick={() => this.props.authNav('signup')}>Sign up</a>
        </LinkFont>
      </div>
    );
  }
}

export default LoginForm;
