import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShadowButton from '../common/ShadowButton';
import Modal from '../common/modal';
import * as actionCreators from '../../../actions/auth.actions';
import * as socketActions from '../../actions/socket';
import Marquee from './marquee';

if (process.env.BROWSER === true) {
  require('./main.css');
}

export class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.close = this.close.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      modal: false,
      email: ''
    };
  }

  componentDidMount() {
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    this.props.actions.signupForMailingList(this.state.email);
    this.setState({ email: '' });
  }

  close() {
    this.setState({ modal: !this.state.modal });
  }

  login() {
    let user = {
      name: this.username,
      password: this.password
    };
    let redirect = this.props.location.query.redirect || '/login';
    this.props.actions.loginUser(user, redirect);
    this.setState({ modal: !this.state.modal });
  }

            // <input
            //   className="blueInput"
            //   value={this.name}
            //   onChange={(name) => {
            //     this.name = name.target.value;
            //   }}
            //   type="text"
            //   name="name"
            //   placeholder="Your name"
            // />
            // <input
            //   className="blueInput"
            //   value={this.topics}
            //   onChange={(topics) => {
            //     this.topics = topics.target.value;
            //   }}
            //   type="text"
            //   name="topics"
            //   placeholder="Topics you know most about"
            // />

  render() {
    let login = (
      <div className="loginBar">
        <p>beta tester?</p>
        <a style={{ cursor: 'pointer' }} onClick={() => this.setState({ modal: !this.state.modal })}>
          login to post
        </a>
      </div>
    );
    return (
      <div className="splashContainer">

        <Marquee {...this.props} />

        {/*login*/}

        <div className="splashContent">

          <section className="header">
            <img src="/img/logo.svg" alt="logo" />
          </section>
          <div className="divider" />

          <mainSection>
            <img src="/img/phone.png" alt="phone" className="phone" />

            <section className="body">
              <p className="libre">
                <span className="outline">
                  Relevant
                </span> is a community of thought leaders who care about <span className="outline">the truth</span>.
                Do you have something to contribute?
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
                <input
                  className="blueInput"
                  value={this.state.email}
                  onChange={(email) => {
                    this.setState({ email: email.target.value });
                  }}
                  type="text"
                  name="email"
                  placeholder="Your email"
                />
                <ShadowButton
                  color={'#3E3EFF'}
                  onClick={this.submit}
                >
                  Submit
                </ShadowButton>
              </div>
            </section>

          </mainSection>
          <section className="copyright">
            <div className="rParent">
              <img src="/img/r.svg" alt="relevant" className="r" />
            </div>
            <div className="copyrightParent georgia">
              <p>
                Copyright 2017. All rights reserved.
              </p>
              <p>
                Relevant is created by <a href="http://4real.io/">4Real</a> & <a href="http://www.phillipfivel.com/">Phillip Fivel Nessen</a>
              </p>
            </div>
          </section>
        </div>

        <Modal
          visible={this.state.modal}
          close={this.close}
          title={'login'}
        >
          <p className="loginText">{this.props.title}</p>
          <input
            className="blueInput special"
            value={this.username}
            onChange={(username) => {
              this.username = username.target.value;
            }}
            type="text"
            name="username"
            placeholder="username"
          />
          <input
            className="blueInput special pass"
            value={this.password}
            onChange={(password) => {
              this.password = password.target.value;
            }}
            type="password"
            name="password"
            placeholder="password"
          />
          <ShadowButton
            backgroundColor={'white'}
            color={'#3E3EFF'}
            onClick={this.login}
          >
            Login
          </ShadowButton>
        </Modal>

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
  actions: bindActionCreators(Object.assign({}, actionCreators, socketActions), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Main);
