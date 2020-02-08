import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import ReduxFormImageUpload from 'modules/styled/form/reduxformimageupload.component';
import {
  required,
  email as validEmail,
  validCharacters,
  compose,
  asyncUsername,
  asyncEmail
} from 'modules/form/validators';
import { FormImage } from 'modules/styled/uni';

// Please note, this only works if the field is called 'image'
export const image = {
  name: 'image',
  component: ReduxFormImageUpload,
  placeholder: '/img/blueR.png',
  imageComponent: <FormImage />,
  type: 'file-upload',
  label: 'User Image'
};
export const username = {
  name: 'username',
  component: ReduxFormField,
  type: 'text',
  label: 'Username',
  autocomplete: 'username',
  validate: compose(
    required,
    validCharacters,
    asyncUsername
  )
};
export const email = {
  name: 'email',
  type: 'email',
  label: 'Email',
  component: ReduxFormField,
  autocomplete: 'username',
  validate: compose(
    required,
    validEmail,
    asyncEmail
  )
};
export const password = {
  name: 'password',
  type: 'password',
  label: 'Password',
  autocomplete: 'new-password',
  component: ReduxFormField,
  validate: required
};
export const confirmPassword = {
  name: 'confirmPassword',
  type: 'password',
  autocomplete: 'new-password',
  label: 'Confirm Password',
  component: ReduxFormField,
  validate: required
};
