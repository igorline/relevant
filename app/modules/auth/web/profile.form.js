import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { LinkFont } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import { s3, alert } from 'app/utils';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from 'modules/auth/auth.actions';
import { Form, Field } from 'react-final-form';
import { Form as StyledForm, View, Button } from 'modules/styled/web';
import {
  image,
  email,
  username,
  password,
  confirmPassword
} from 'modules/auth/form.fields';
import { passwordsShouldMatch } from 'modules/form/validators';

const Alert = alert.Alert();

ProfileForm.propTypes = {
  initialValues: PropTypes.object,
  additionalFields: PropTypes.object,
  close: PropTypes.func
};

export default function ProfileForm({
  initialValues = {},
  additionalFields = {},
  close
}) {
  const { ethLogin, signupCallback } = additionalFields;
  const signup = useSignUp(additionalFields, close, signupCallback);
  const onSubmit = useOnSubmit(signup);

  const showEmailField = initialValues.email ? null : email;
  const showPass = ethLogin ? null : password;
  const showConfirmPass = showPass ? confirmPassword : null;

  const FORM_FIELDS = [image, username, showEmailField, showPass, showConfirmPass].filter(
    f => f
  );

  return (
    <Form
      onSubmit={onSubmit}
      validate={passwordsShouldMatch}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <StyledForm fdirection="column" onSubmit={handleSubmit}>
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
        </StyledForm>
      )}
    />
  );
}

function useOnSubmit(signup) {
  return useCallback(
    async vals => {
      try {
        const allVals = { ...vals };
        if (allVals.image && allVals.image.preview && allVals.image.fileName) {
          const img = await s3.toS3Advanced(
            allVals.image.preview,
            allVals.image.fileName
          );
          allVals.image = img.url;
        }
        signup(allVals);
      } catch (err) {
        Alert.alert(err.message, 'error');
      }
    },
    [signup]
  );
}

function useSignUp(additionalFields, close, signupCallback) {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { invitecode } = auth;

  return useCallback(
    async data => {
      try {
        const user = {
          name: data.username,
          email: data.email,
          password: data.password,
          image: data.image,
          ...additionalFields
        };
        await dispatch(createUser(user, invitecode));
        signupCallback && signupCallback(user);
        close();
      } catch (err) {
        Alert.alert(err.message, 'error');
      }
    },
    [additionalFields, dispatch, invitecode, close, signupCallback]
  );
}
