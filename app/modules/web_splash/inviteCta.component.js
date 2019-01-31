import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import ShadowButton from 'modules/ui/web/ShadowButton';
import { browserAlerts } from 'app/utils/alert';

class InviteCta extends Component {
  static propTypes = {
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      email: '',
      name: ''
    };
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    const { name, email } = this.state;
    if (!name || name === '') {
      // TODO error handling
      return browserAlerts.alert('missing name');
    }
    if (
      !email ||
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      // TODO error handling
      return browserAlerts.alert('bad email');
    }
    this.props.actions.signupForMailingList({
      name,
      email
    });
    this.setState({ email: '', name: '' });

    window.fbq('track', 'waitlist', {
      name
    });
    return null;
  }

  render() {
    return (
      <section className="invitation">
        <div>
          {/*          <p>
            Sign up for your invitation to Relevant.
          </p> */}

          <input
            className="blueInput"
            value={this.state.name}
            onChange={e => {
              this.setState({ name: e.target.value });
            }}
            autoCorrect="off"
            type="text"
            name="name"
            placeholder="Your name"
          />

          <br />

          <input
            className="blueInput"
            value={this.state.email}
            onChange={e => {
              this.setState({ email: e.target.value });
            }}
            autoCapitalize="off"
            autoCorrect="off"
            type="email"
            name="email"
            placeholder="Your email"
          />

          <ShadowButton style={{ margin: '10px 0 10px 0' }} color={'#3E3EFF'} onClick={this.submit}>
            Join Waitlist
          </ShadowButton>
        </div>
      </section>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...adminActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteCta);
