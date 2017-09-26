import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShadowButton from '../common/ShadowButton';

import * as actionCreators from '../../../actions/admin.actions';
import Marquee from './marquee';
import Footer from '../common/footer.component';
import Mission from './mission.component';

if (process.env.BROWSER === true) {
  require('./main.css');
}

export class Main extends Component {
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
      <div className="splashContainer">
        <Marquee {...this.props} />

        <div className="splashContent">

          <mainSection>
            <section className="body">
              <p className="libre">
                <span className="outline">
                  Relevant
                </span> is a social news reader that values <span className="outline">quality</span> over clicks.
                {/* <a href="http://www.apple.com" className="download">
                  <img src="/img/apple.png" />
                  <span className="bebasRegular">download</span>
                </a> */}
              </p>
            </section>

            <section className="invitation">
              <div>
                <p>
                  Sign up for your <br />invitation to Relevant.
                </p>

                <div style={{ display: 'inline-block' }}>
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


                </div>

                <ShadowButton
                  style={{ margin: '10px 0 10px 0' }}
                  color={'#3E3EFF'}
                  onClick={this.submit}
                >
                  Submit
                </ShadowButton>
              </div>
            </section>

          </mainSection>

          <div className="phone">
            <img src="/img/hand.jpg" alt="phone" />
          </div>

        </div>

        <Mission />
        <Footer />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message
});

const mapDispatchToProps = (dispatch) => (Object.assign({}, { dispatch }, {
  actions: bindActionCreators(Object.assign({}, actionCreators), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Main);
