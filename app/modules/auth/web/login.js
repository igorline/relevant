import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkFont, Image, ViewButton } from 'modules/styled/uni';
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
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { required } from 'modules/form/validators';
import BoxLogin from 'modules/auth/web/login.3box';

const twitterIcon = require('app/public/img/icons/twitter_white.png');
// const redditIcon = require('app/public/img/icons/reddit.png');

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

    const socialSignup = (
      <LinkFont shrink={1} mt={[0, 4]}>
        Not registered yet?{' '}
        <a
          onClick={() => {
            this.props.actions.showModal('signupSocial');
          }}
        >
          Sign up
        </a>
      </LinkFont>
    );

    return (
      <Form fdirection="column" onSubmit={handleSubmit(this.login)}>
        {FORM_FIELDS.map(field => (
          <Field {...field} key={field.name} />
        ))}
        <View
          mt={2}
          display="flex"
          fdirection="column"
          align="flex-start"
          justify="flex-start"
        >
          <a
            onClick={() => {
              this.props.actions.showModal('forgot');
            }}
          >
            <LinkFont c={colors.blue}>Forgot Your Password?</LinkFont>
          </a>
          {local ? (
            <View fdirection="row" mt={[4, 2]} align="center">
              <Button onClick={this.submit} type="submit" mr={[2, 0]} fdirection="row">
                {' '}
                Sign In{' '}
              </Button>
              {socialSignup}
            </View>
          ) : null}
        </View>

        <View>
          {!local ? (
            <View
              fdirection={['row', 'column']}
              align={['center', 'stretch']}
              mt={[4, 2]}
              flex={1}
            >
              <ULink
                to={`/auth/twitter?redirect=${redirect}&invitecode=${invitecode}`}
                external
                rel="nofollow"
                mr={[2, 0]}
                mt={[0, 2]}
              >
                <ViewButton flex={1} bg={colors.twitterBlue} fdirection="row">
                  <Image source={twitterIcon} w={2.5} h={2.5} mr={1.5} />
                  <LinkFont c={colors.white}>Sign In with Twitter</LinkFont>
                </ViewButton>
              </ULink>
              <BoxLogin close={this.props.close} />
              {socialSignup}
            </View>
          ) : null}
        </View>
      </Form>
    );
  }
}

const selector = formValueSelector('login');

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth,
  ...selector(state, 'username', 'password'),
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
