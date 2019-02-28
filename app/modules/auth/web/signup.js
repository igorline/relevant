import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NAME_PATTERN } from 'app/utils/text';
import { browserAlerts } from 'app/utils/alert';
import FormField from 'modules/styled/form/field.component';
import SetHandle from 'modules/auth/web/handle.component';
import {
  SecondaryText,
  Button,
  Image,
  View,
  LinkFont,
  Touchable
} from 'modules/styled/uni';
import { colors, mixins } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import ImageUpload from 'modules/ui/web/imageUpload.component';
import RIcon from 'app/public/img/r.svg';
import styled from 'styled-components';
import queryString from 'query-string';

const StyledRIcon = styled(RIcon)`
  * {
    fill: white;
  }
  ${mixins.padding}
  ${mixins.margin}
  ${mixins.image}
  ${mixins.width}
  ${mixins.height}
  ${mixins.background}
  ${mixins.borderRadius}
`;

const twitterIcon = '/img/icons/twitter_white.png';

class SignupForm extends Component {
  static propTypes = {
    location: PropTypes.object,
    actions: PropTypes.object,
    parentFunction: PropTypes.func,
    user: PropTypes.object,
    authNav: PropTypes.func,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      cPassword: '',
      errors: {},
      provider: 'twitter'
    };

    this.errors = {
      username: null,
      email: null,
      cPassword: null,
      password: null
    };

    this.checkUser = this.checkUser.bind(this);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  checkEmail() {
    const string = this.state.email;
    if (!string.length) return null;
    const valid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(string);
    if (!valid) return this.setState({ errors: { email: 'invalid email' } });

    return this.props.actions.checkUser(string, 'email').then(results => {
      if (results) {
        return this.setState({ errors: { email: 'This email has already been used' } });
      }
      return null;
    });
  }

  checkUser(name) {
    this.nameError = null;
    const { user } = this.props.auth;
    const toCheck = name || this.state.name;
    if (toCheck) {
      const string = toCheck;
      const match = NAME_PATTERN.test(string);
      if (match) {
        this.props.actions.checkUser(string, 'name').then(results => {
          if (results && (!user || user._id !== results._id)) {
            this.usernameExists = true;
            this.nameError = 'This username is already taken';
          } else this.usernameExists = false;
          this.setState({});
        });
      } else {
        this.nameError =
          'username can only contain letters, \nnumbers, dashes and underscores';
        this.setState({});
      }
    }
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  componentWillUpdate(newProps, newState) {
    if (newState !== this.state) {
      // this.validate(newState);
    }
  }

  async submit() {
    if (!this.state.email) {
      browserAlerts.alert('email required');
      return;
    }
    if (!this.state.username) {
      browserAlerts.alert('username requied');
      return;
    }
    if (!this.state.password) {
      browserAlerts.alert('password required');
      return;
    }
    if (!this.state.cPassword) {
      browserAlerts.alert('confirm password');
      return;
    }
    if (this.state.password !== this.state.cPassword) {
      browserAlerts.alert("passwords don't match");
      return;
    }
    if (!this.imageUploader.state.preview) {
      this.props.parentFunction(this.state);
      return;
    }
    try {
      const image = await this.imageUploader.uploadImage();
      // TODO:
      // if (!image) {
      // Handle Error
      // }
      if (image && image.url) {
        const params = { ...this.state, image: image.url };
        this.props.parentFunction(params);
      }
    } catch (err) {
      // TODO error handling
    }
  }

  renderTwitter() {
    const { location } = this.props;
    let { redirect } = queryString.parse(location.search);
    if (!redirect) redirect = location.pathname;
    const { invitecode } = this.props.auth;

    return (
      <View display="flex" fdirection="column" align-items="flex-start">
        <SecondaryText>
          Sign up to Relevant with your Twitter account or your Email.
        </SecondaryText>
        <View display="flex" fdirection="row" align="center" mt={7}>
          <ULink
            to={`/auth/twitter?invitecode=${invitecode}&redirect=${redirect}`}
            external
            mr={4}
          >
            <Button bg={colors.twitterBlue}>
              <Image source={twitterIcon} w={2} h={2} mr={2} />
              Sign up with Twitter
            </Button>
          </ULink>
          <Touchable
            onPress={e => {
              e.preventDefault();
              this.setState({ provider: 'email' });
            }}
          >
            <LinkFont c={colors.blue}>Sign up with Email</LinkFont>
          </Touchable>
        </View>
        <LinkFont mt={4}>
          Already registered?{' '}
          <ULink onClick={() => this.props.authNav('login')} to="#" c={colors.blue}>
            Sign In
          </ULink>
        </LinkFont>
      </View>
    );
  }

  render() {
    const { errors, provider } = this.state;

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
      return this.renderTwitter();
    }
    if (provider === 'email') {
      const FORM_FIELDS = [
        {
          error: this.nameError,
          placeholder: 'username',
          label: 'Username',
          value: this.state.username,
          key: 'Username',
          onChange: e => {
            const username = e.target.value.trim();
            this.checkUser(username.trim());
            this.handleChange('username', username);
          },
          type: 'text'
        },
        {
          key: 'email',
          type: 'email',
          placeholder: 'Email',
          label: 'Email',
          value: this.state.email,
          onChange: email => {
            this.handleChange('email', email.target.value);
          },
          onBlur: this.checkEmail.bind(this),
          onFocus: () => this.setState({ errors: { email: null } }),
          error: errors.email
        },
        {
          key: 'password',
          type: 'password',
          placeholder: 'Password',
          label: 'Password',
          value: this.state.password,
          onChange: password => {
            this.handleChange('password', password.target.value);
          },
          error: errors.password
        },
        {
          key: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm Password',
          label: 'Confirm Password',
          value: this.state.cPassword,
          onChange: cPassword => {
            this.handleChange('cPassword', cPassword.target.value);
          },
          onKeyDown: e => {
            if (e.keyCode === 13) {
              this.submit();
            }
          },
          error: errors.Cpassword
        }
      ];
      return (
        <div>
          <ImageUpload
            ref={c => (this.imageUploader = c)}
            placeholder={<StyledRIcon bg={colors.blue} bradius="50%" p={2} w={9} h={9} />}
            imageComponent={<Image bg={colors.blue} bradius="50%" p={2} w={9} h={9} />}
          />
          {FORM_FIELDS.map(field => (
            <FormField {...field} />
          ))}
          <View display="flex" fdirection="row" justify="flex-end" mt={6} align="center">
            <LinkFont>
              By signing up, you agree to our{' '}
              <ULink to="//relevant.community/eula.html" external target="_blank">
                Terms of Use
              </ULink>
            </LinkFont>
            <Button onClick={this.submit} ml={2.5}>
              Sign Up
            </Button>
          </View>
        </div>
      );
    }
    return null;
  }
}

export default SignupForm;
