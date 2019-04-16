import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { LinkFont, Image } from 'modules/styled/uni';
import { Form, View, Button } from 'modules/styled/web';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import queryString from 'query-string';
import { loginUser } from 'modules/auth/auth.actions';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { Field, reduxForm } from 'redux-form';
import { required } from 'modules/form/validators';

const twitterIcon = require('app/public/img/icons/twitter_white.png');
const redditIcon = require('app/public/img/icons/reddit.png');

class LoginForm extends Component {
  static propTypes = {
    location: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object,
    close: PropTypes.func,
    handleSubmit: PropTypes.func,
    username: PropTypes.string,
    password: PropTypes.string
  };

  login = async data => {
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
  };

  render() {
    const { location, handleSubmit, username, password } = this.props;
    const { invitecode } = this.props.auth;
    const local = username && username.length && password && password.length;
    let { redirect } = queryString.parse(location.search);
    if (!redirect) redirect = location.pathname;

    const FORM_FIELDS = [
      {
        label: 'Username or email',
        component: ReduxFormField,
        name: 'username',
        autocomplete: 'username',
        type: 'text',
        validate: [required]
      },
      {
        type: 'password',
        component: ReduxFormField,
        label: 'Password',
        name: 'password',
        autocomplete: 'current-password',
        validate: [required]
      }
    ];

    return (
      <Form fdirection="column" onSubmit={handleSubmit(this.login)}>
        {FORM_FIELDS.map(field => (
          <Field {...field} key={field.name} />
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
                  this.props.actions.showModal('signup');
                }}
              >
                Sign up
              </a>
            </LinkFont>
          </View>
        </View>
      </Form>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth,
  // TODO:
  // See if there's a better way to do this, perhaps using formValueSelector?
  password: get(state.form, 'login.values.password'),
  username: get(state.form, 'login.values.username'),
  initialValues: {},
  enableReinitialize: true
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
  )(
    reduxForm({
      form: 'login'
    })(LoginForm)
  )
);
