import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, BodyText, SecondaryText } from 'modules/styled/uni';
import { reduxForm } from 'redux-form';
import { Button } from 'modules/styled/web';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { sendConfirmation } from 'modules/auth/auth.actions';

class EmailConfirm extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    initialize: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      sending: false,
      email: null
    };
  }

  static getDerivedStateFromProps(props) {
    const email = props.auth.user ? props.auth.user.email : null;
    const confirmed = props.auth.user ? props.auth.user.confirmed : null;
    return { email, confirmed };
  }

  componentDidUpdate() {
    this.props.initialize(this.state);
  }

  sendConfirmation = () => {
    this.setState({ sending: true });
    this.props.actions.sendConfirmation().then(() => {
      this.setState({ sending: false });
    });
  };

  render() {
    let text = 'Your email has been confirmed';
    let resend;
    if (!this.props.auth || !this.props.auth.user || !this.props.auth.user.confirmed) {
      text = 'Your email is not confirmed';
      if (this.props.auth.user) {
        resend = (
          <View justify={['flex-end', 'stretch']} fdirection="column">
            <Button
              mr={['auto', 0]}
              mt={4}
              onClick={this.sendConfirmation}
              p={0}
              disabled={this.state.sending}
            >
              Resend email confirmation code
            </Button>
            <SecondaryText mt={2}>
              If you don't see an email in your inbox, please check your spam folder
            </SecondaryText>
          </View>
        );
      }
    }

    return (
      <View fdirection="column">
        <BodyText>{text}</BodyText>
        {resend}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      sendConfirmation
    },
    dispatch
  )
});

export default reduxForm({
  form: 'emailConfirm',
  enableReinitialize: true
})(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EmailConfirm)
);
