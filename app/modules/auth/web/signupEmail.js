import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, LinkFont } from 'modules/styled/uni';
import { colors, mixins } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import ImageUpload from 'modules/ui/web/imageUpload.component';
import RIcon from 'app/public/img/r.svg';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { loginUser, checkUser, createUser } from 'modules/auth/auth.actions';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { Field, reduxForm } from 'redux-form';
import { Form, View, Button } from 'modules/styled/web';
import {
  required,
  email,
  validCharacters,
  signupAsyncValidation
} from 'modules/form/validators';

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

class SignupEmail extends Component {
  static propTypes = {
    location: PropTypes.object,
    actions: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object,
    handleSubmit: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.signup = this.signup.bind(this);
  }

  signup = async data => {
    const { invitecode } = this.props.auth;
    const { actions } = this.props;
    try {
      const user = {
        name: data.username,
        email: data.email,
        password: data.password,
        image: data.image
      };
      const signedUp = await actions.createUser(user, invitecode);
      if (signedUp) {
        this.close();
      }
    } catch (err) {
      // TODO error handling
    }
  };

  submit = async values => {
    if (!this.imageUploader.state.preview) {
      this.signup(values);
      return;
    }
    try {
      const image = await this.imageUploader.uploadImage();
      // TODO:
      // if (!image) {
      // Handle Error
      // }
      if (image && image.url) {
        const params = { ...values, image: image.url };
        this.signup(params);
      }
    } catch (err) {
      // TODO error handling
    }
  };

  render() {
    const { handleSubmit } = this.props;
    const FORM_FIELDS = [
      {
        name: 'username',
        component: ReduxFormField,
        type: 'text',
        label: 'Username',
        autocomplete: 'username',
        // TODO: TRIM USER VALUE?
        validate: [required, validCharacters]
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        component: ReduxFormField,
        autocomplete: 'username',
        validate: [required, email]
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        autocomplete: 'new-password',
        component: ReduxFormField,
        validate: [required]
      },
      {
        name: 'confirmPassword',
        type: 'password',
        autocomplete: 'new-password',
        label: 'Confirm Password',
        component: ReduxFormField,
        validate: [required]
      }
    ];
    return (
      <Form fdirection="column" onSubmit={handleSubmit(this.submit)}>
        <ImageUpload
          ref={c => (this.imageUploader = c)}
          placeholder={<StyledRIcon bg={colors.blue} bradius="50%" p={2} w={9} h={9} />}
          imageComponent={<Image bg={colors.blue} bradius="50%" p={2} w={9} h={9} />}
        />
        {FORM_FIELDS.map(field => (
          <Field {...field} key={field.name} />
        ))}
        <View display="flex" fdirection="row" justify="flex-end" mt={6} align="center">
          <LinkFont inline={1}>
            By signing up, you agree to our{' '}
            <ULink
              to="//relevant.community/eula.html"
              external
              target="_blank"
              inline={1}
            >
              Terms of Use
            </ULink>
          </LinkFont>
          <Button type="submit" ml={2.5}>
            Sign Up
          </Button>
        </View>
      </Form>
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
      showModal,
      checkUser,
      createUser
    },
    dispatch
  )
});

const validate = values => {
  // console.log('validate', values);
  const errors = {};
  if (!values.password || !values.confirmPassword) {
    return null;
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }
  return errors;
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    reduxForm({
      form: 'signup',
      validate,
      asyncValidate: signupAsyncValidation,
      asyncChangeFields: ['username', 'email']
    })(SignupEmail)
  )
);
