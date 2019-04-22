import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReduxFormImageUpload from 'modules/styled/form/reduxformimageupload.component';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { View, Button } from 'modules/styled/web';
import { FormImage } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { Field, reduxForm } from 'redux-form';
import styled from 'styled-components';
import { required } from 'modules/form/validators';
import ULink from 'modules/navigation/ULink.component';
import NotificationSettings from 'modules/profile/notificationSettings.component';
import AvatarFieldPlaceholder from 'modules/form/avatarFieldPlaceholder.component';
import { withRouter } from 'react-router-dom';

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

class SettingsModal extends Component {
  render() {
    const { handleSubmit, initialValues, location } = this.props;
    const FORM_FIELDS = [
      {
        name: 'image',
        component: ReduxFormImageUpload,
        placeholder: <AvatarFieldPlaceholder user={initialValues} />,
        imageComponent: <FormImage />,
        type: 'file-upload',
        label: 'User Image',
        validate: []
      },
      {
        name: 'name',
        component: ReduxFormField,
        type: 'text',
        label: 'Display Name',
        validate: [required]
      },
      {
        name: 'bio',
        component: ReduxFormField,
        type: 'text',
        label: 'Bio'
      }
    ];
    return (
      <View display="flex" fdirection="column">
        <Form onSubmit={handleSubmit}>
          {FORM_FIELDS.map((field, index) => (
            <Field {...field} key={index} />
          ))}
          <ULink mt={2} to={`/user/resetPassword${location.search}`}>
            Reset Password
          </ULink>
          <View justify="flex-end" mt={3} fdirection="row">
            <Button bg={colors.white} c={colors.black} onClick={() => this.props.close()}>
              Cancel
            </Button>
            <Button ml={2} c={colors.white} type="submit">
              Submit
            </Button>
          </View>
        </Form>
        <NotificationSettings />
      </View>
    );
  }
}

SettingsModal.propTypes = {
  close: PropTypes.func,
  handleSubmit: PropTypes.func,
  initialValues: PropTypes.object,
  actions: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(
  reduxForm({
    form: 'settings'
  })(SettingsModal)
);
