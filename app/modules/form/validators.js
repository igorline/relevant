import { NAME_PATTERN } from 'app/utils/text';
import { checkUser } from 'modules/auth/auth.actions';

export const required = value =>
  value || typeof value === 'number' ? undefined : 'Required';

export const email = value => {
  if (!value) {
    return undefined;
  }
  const valid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,15}$/i.test(value);
  if (valid) {
    return undefined;
  }
  return 'Not a valid e-mail';
};

export const validCharacters = value => {
  const match = NAME_PATTERN.test(value);
  if (!match) {
    return 'Can only contain letters, \nnumbers, dashes and underscores';
  }
  return undefined;
};

export const asyncEmail = async value => {
  const results = await checkUser(value, 'email', true)();
  if (results) {
    return 'This email has already been used';
  }
  return undefined;
};

export const asyncUsername = async value => {
  if (value) {
    const results = await checkUser(value, 'name', true)();
    // TODO: no error if username is own username
    if (results) {
      return 'This username is already taken';
    }
  }
  return undefined;
};

export const signupAsyncValidation = async values => {
  // console.log('props  ', props  );
  const errors = {};
  if (values.username) {
    const error = await asyncUsername(values.username);
    if (error) {
      errors.username = error;
    }
  }
  if (values.email) {
    const error = await asyncEmail(values.email);
    if (error) {
      errors.email = error;
    }
  }
  if (values.handle) {
    const error = await asyncUsername(values.handle);
    if (error) {
      errors.handle = error;
    }
  }
  if (Object.keys(errors).length) {
    throw errors;
  }
};

export const passwordsShouldMatch = values => {
  const errors = {};
  if (!values.password || !values.confirmPassword) {
    return null;
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }
  return errors;
};

export const compose = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined);
