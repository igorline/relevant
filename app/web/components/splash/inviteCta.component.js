import React, {
  Component,
} from 'react';

import ShadowButton from '../common/ShadowButton';

export default class InviteCta extends Component {
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
    let { name, email } = this.state;
    if (!name || name == '') {
      return window.alert('missing name');
    }
    if (!email || !email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      return window.alert('bad email');
    }
    this.props.actions.signupForMailingList({
      name,
      email
    });
    this.setState({ email: '', name: '' });

    window.fbq('track', 'waitlist', {
      name,
    });
  }

  render() {
    return (
      <section className="invitation">
        <div>
{/*          <p>
            Sign up for your invitation to Relevant.
          </p>*/}

            <input
              className="blueInput"
              value={this.state.name}
              onChange={(e) => {
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
              onChange={(e) => {
                this.setState({ email: e.target.value });
              }}
              autoCapitalize="off"
              autoCorrect="off"
              type="email"
              name="email"
              placeholder="Your email"
            />



          <ShadowButton
            style={{ margin: '10px 0 10px 0' }}
            color={'#3E3EFF'}
            onClick={this.submit}
          >
            Get Invitation
          </ShadowButton>
        </div>
      </section>
    );
  }
}
