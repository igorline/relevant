import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  loginUser,
  checkUser,
  createUser,
  updateHandle
} from 'modules/auth/auth.actions';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import {
  required,
  email,
  validCharacters,
  signupAsyncValidation
} from 'modules/form/validators';
import { Field, reduxForm } from 'redux-form';
import {
  Form,
  // BodyText,
  Button,
  View
} from 'modules/styled/web';

class SetHandle extends Component {
  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.object,
    checkUser: PropTypes.func,
    nameError: PropTypes.string,
    handleSubmit: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.updateFormFields();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.updateFormFields();
    }
  }

  updateFormFields = () => {
    const { user } = this.props;
    this.FORM_FIELDS = [
      {
        name: 'username',
        component: ReduxFormField,
        type: 'text',
        label: 'Username',
        placeholder: 'Choose your handle:',
        validate: [required, validCharacters]
      },
      {
        name: 'email',
        component: ReduxFormField,
        type: 'email',
        label: 'Email',
        placeholder: 'Email (optional for email reset and notifications)',
        validate: [required, email],
        isHidden: user && user.email
      }
    ];
  };

  submit = values => {
    const { user, actions } = this.props;
    // console.log('submit', values, updatedUser);
    const updatedUser = { ...user, values };
    actions.updateHandle(updatedUser);
  };

  render() {
    const {
      handleSubmit
      // user
    } = this.props;
    // if (!user) {
    //   return (
    //     <View>
    //       <BodyText> You must be logged in to change your handle.</BodyText>
    //     </View>
    //   );
    // }
    return (
      <Form fdirection="column" onSubmit={handleSubmit(this.submit)}>
        {this.FORM_FIELDS.map(field =>
          field.isHidden ? null : <Field {...field} key={field.name} />
        )}
        <View justify="flex-start">
          <Button type="submit" ml="auto" mt={4}>
            Finish
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
      createUser,
      updateHandle
    },
    dispatch
  )
});

const validate = () => {};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    reduxForm({
      form: 'setHandle',
      validate,
      asyncValidate: signupAsyncValidation,
      asyncChangeFields: ['username', 'email']
    })(SetHandle)
  )
);
