import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { Field, reduxForm } from 'redux-form';
import { Button, Form, View } from 'modules/styled/web';
import { required } from 'modules/form/validators';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resetPassword } from 'modules/auth/auth.actions';
import { hideModal, showModal } from 'modules/navigation/navigation.actions';

class ResetPassword extends Component {
  static propTypes = {
    match: PropTypes.object,
    actions: PropTypes.object,
    history: PropTypes.object,
    handleSubmit: PropTypes.func,
    authNav: PropTypes.func,
    auth: PropTypes.object,
    close: PropTypes.func,
    showModal: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  componentWillMount() {
    this.token = this.props.match.params.token;
  }

  submit(vals) {
    const { user } = this.props.auth;
    this.props.actions.resetPassword(vals.password, this.token).then(success => {
      if (success && !user) {
        this.props.showModal('login');
        // this.props.authNav('login');
        // OPEN LOGIN MODAL
      } else {
        this.props.close();
      }
    });
  }

  render() {
    const { handleSubmit } = this.props;
    const FORM_FIELDS = [
      {
        name: 'password',
        component: ReduxFormField,
        type: 'password',
        label: 'Password',
        validate: [required]
      },
      {
        name: 'confirmPassword',
        component: ReduxFormField,
        type: 'password',
        label: 'Confirm Password',
        validate: [required]
      }
    ];
    return (
      <View display="flex" fdirection="column" m={'4 0'}>
        <Form fdirection="column" onSubmit={handleSubmit(this.submit.bind(this))}>
          {FORM_FIELDS.map((field, index) => (
            <Field {...field} key={index} />
          ))}
          <View mt={4} ml={0} justify="flex-end">
            <Button type="submit" p={0}>
              Update Password
            </Button>
          </View>
        </Form>
      </View>
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
      resetPassword,
      hideModal,
      showModal
    },
    dispatch
  )
});

export default withRouter(
  reduxForm({
    form: 'settings',
    validate: vals => {
      const errors = {};
      if (vals.password !== vals.confirmPassword) {
        const message = 'Passwords must be identical';
        errors.password = message;
        errors.confirmPassword = message;
      }
      return errors;
    }
  })(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ResetPassword)
  )
);
