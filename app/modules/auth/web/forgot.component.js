import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BodyText, LinkFont } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { showModal } from 'modules/navigation/navigation.actions';
import { forgotPassword } from 'modules/auth/auth.actions';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { required } from 'modules/form/validators';
import { Field, reduxForm } from 'redux-form';
import { Form, View, Button } from 'modules/styled/web';
import queryString from 'query-string';

class Forgot extends Component {
  static propTypes = {
    actions: PropTypes.object,
    location: PropTypes.object,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      sentEmailTo: null
    };

    this.FORM_FIELDS = [
      {
        name: 'username',
        component: ReduxFormField,
        type: 'text',
        placeholder: 'Username or Email',
        validate: [required]
      }
    ];
  }

  sendEmail = async data => {
    const { actions, location } = this.props;
    const params = queryString.parse(location.search);
    delete params.modal;
    const queryParams = '?' + queryString.stringify(params);
    const res = await actions.forgotPassword(data.username, queryParams);
    if (res && res.email) {
      this.setState({ sentEmailTo: res.email });
    }
  };

  render() {
    const { handleSubmit } = this.props;
    if (this.state.sentEmailTo) {
      return (
        <BodyText c={colors.black}>
          We have set an email to {this.state.sentEmailTo} with a link to reset your
          password.{'\n'}
          If you don't see a password reset email in your inbox, please check your spam
          folder.
        </BodyText>
      );
    }
    return (
      <View fdirection="column">
        <Form fdirection="column" onSubmit={handleSubmit(this.sendEmail)}>
          {this.FORM_FIELDS.map((field, index) => (
            <Field {...field} key={index} />
          ))}
          <View display="flex" fdirection="row" align="center" mt={7} justify="flex-end">
            <LinkFont shrink={1}>
              Back to <a onClick={() => this.props.actions.showModal('login')}>Sign in</a>
            </LinkFont>
            <Button type="submit" m={0} ml={2}>
              Send Recovery Email
            </Button>
          </View>
        </Form>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  auth: state.auth,
  initialValues: {},
  enableReinitialize: true
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      showModal,
      forgotPassword
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
      form: 'forgotPassword'
    })(Forgot)
  )
);
