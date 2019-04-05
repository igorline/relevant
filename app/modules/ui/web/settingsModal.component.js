import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReduxFormImageUpload from 'modules/styled/form/reduxformimageupload.component';
import RIcon from 'app/public/img/r.svg';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { View, Button } from 'modules/styled/web';
import { Image } from 'modules/styled/uni';
import { colors, mixins } from 'app/styles';
import { Field, reduxForm } from 'redux-form';
import styled from 'styled-components';
import { required } from 'modules/form/validators';
import UAvatar from 'modules/user/UAvatar.component';
import ULink from 'modules/navigation/ULink.component';
import { withRouter } from 'react-router-dom';

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

class SettingsModal extends Component {
  render() {
    const { handleSubmit, initialValues, location } = this.props;

    const imageProps = {
      p: 2,
      w: 9,
      h: 9,
      m: '1 0 0 0',
      bg: colors.blue,
      bradius: '50%'
    };
    const imagePlaceholder = initialValues.image ? (
      <UAvatar user={initialValues} size={9} {...imageProps} />
    ) : (
      <StyledRIcon {...imageProps} />
    );

    const FORM_FIELDS = [
      {
        name: 'image',
        component: ReduxFormImageUpload,
        placeholder: imagePlaceholder,
        imageComponent: <Image bg={colors.blue} {...imageProps} />,
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
