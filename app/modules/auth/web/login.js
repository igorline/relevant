import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, LinkFont, View, Image } from 'modules/styled/uni';
import FormField from 'modules/styled/form/field.component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserAlerts } from 'app/utils/alert';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import queryString from 'query-string';
import { loginUser } from 'modules/auth/auth.actions';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';

const twitterIcon = require('app/public/img/icons/twitter_white.png');
const redditIcon = require('app/public/img/icons/reddit.png');

class LoginForm extends Component {
  static propTypes = {
    authNav: PropTypes.func,
    location: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object,
    close: PropTypes.func
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

  async login(data) {
    try {
      const user = {
        name: data.username,
        password: data.password
      };
      const loggedIn = await this.props.actions.loginUser(user);
      if (loggedIn) {
        this.props.close();
      }
    } catch (err) {
      // TODO error handling
    }
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
    this.login(this.state);
  }

  render() {
    const { location } = this.props;
    const { invitecode } = this.props.auth;
    const { username, password } = this.state;
    const local = username.length && password.length;
    let { redirect } = queryString.parse(location.search);
    if (!redirect) redirect = location.pathname;

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
        // name: 'Password',
        onChange: Password => {
          this.handleChange('password', Password.target.value);
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
          <a
            onClick={() => {
              this.props.actions.showModal('forgot');
            }}
          >
            <LinkFont c={colors.blue} mt={2}>
              Forgot Your Password?
            </LinkFont>
          </a>
        </View>

        <View
          display="flex"
          fdirection={['row', 'column']}
          align={['center', 'stretch']}
          mt={4}
        >
          {!local && (
            <React.Fragment>
              <ULink
                to={`/auth/twitter?redirect=${redirect}&invitecode=${invitecode}`}
                external
                mr={[2, 0]}
              >
                <Button mt={2} flex={1} bg={colors.twitterBlue}>
                  <Image source={twitterIcon} w={2.5} h={2.5} mr={1.5} />
                  Sign In with Twitter
                </Button>
              </ULink>
            </React.Fragment>
          )}
          {!local ? (
            <React.Fragment>
              <ULink
                flex={1}
                to={`/auth/reddit?redirect=${redirect}&invitecode=${invitecode}`}
                external
                mr={[2, 0]}
              >
                <Button mt={2} flex={1} bg={colors.redditColor}>
                  <Image
                    resizeMode={'contain'}
                    source={redditIcon}
                    w={3}
                    h={3}
                    mr={1.5}
                  />
                  Sign In with Reddit
                </Button>
              </ULink>
            </React.Fragment>
          ) : null}
          {local ? (
            <Button mt={2} onClick={this.submit} mr={[2, 0]}>
              {' '}
              Sign In{' '}
            </Button>
          ) : null}

          <View mt={[2, 4]}>
            <LinkFont shrink={1}>
              Not registered yet?{' '}
              <a
                onClick={() => {
                  // this.props.authNav('signup')
                  this.props.actions.showModal('signup');
                }}
              >
                Sign up
              </a>
            </LinkFont>
          </View>
        </View>
      </div>
    );
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
      showModal
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
