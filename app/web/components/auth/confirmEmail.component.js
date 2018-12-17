import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShadowButton from '../common/ShadowButton';

let styles;

export default class EmailConfirm extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      sending: false
    };
  }

  sendConfirmation() {
    this.setState({ sending: true });
    this.props.actions.sendConfirmation()
    .then(success => {
      this.setState({ sending: false });
      if (success) {
        window.alert('Confirmation email sent');
      }
    });
  }

  render() {
    let text = 'Your email has been confirmed';
    let resend;
    if (!this.props.auth.confirmed) {
      text = 'Oops... something went wrong';
      if (this.props.auth.user && !this.state.sending) {
        resend = (
          <ShadowButton
            style={{ marginTop: '20px' }}
            onClick={() => this.sendConfirmation()}
          >
            Resend email confirmation code
          </ShadowButton>
        );
      }
    }

    return (
      <div style={styles.confirm}>
        {text}
        {resend}
      </div>
    );
  }
}

styles = {
  confirm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '100px',
    fontSize: '20px'
  }
};
