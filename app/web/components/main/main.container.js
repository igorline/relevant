import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SVGInline from 'react-svg-inline';
import ShadowButton from '../common/ShadowButton';
import Modal from '../common/modal';


import * as actionCreators from '../../../actions/admin.actions';
import Marquee from './marquee';

// let SVGInline = null;
let logoSvg = '';

if (process.env.BROWSER === true) {
  require('./main.css');
  logoSvg = require('../../public/img/logo.svg');
  // SVGInline = require('react-svg-inline');
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
      email: '',
      name: ''
    };
  }

  componentDidMount() {
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

  render() {
    // let login = (
    //   <div className="loginBar">
    //     <p>beta tester?</p>
    //     <a style={{ cursor: 'pointer' }} onClick={() => this.setState({ modal: !this.state.modal })}>
    //       login to post
    //     </a>
    //   </div>
    // );

                  // <br />

                  // <input
                  //   className="blueInput"
                  //   value={this.topics}
                  //   onChange={(topics) => {
                  //     this.topics = topics.target.value;
                  //   }}
                  //   type="text"
                  //   name="topics"
                  //   placeholder="Topics of expertise, ex: music, tech"
                  // />


    return (
      <div className="splashContainer">

        <section className="header">
          <img src="/img/logoWhite.svg" alt="logo" />
          {/*<SVGInline style={{ fill: 'white' }} svg={logoSvg} />*/}
        </section>

        <Marquee {...this.props} />

        {/*login*/}

        <div className="splashContent">

          <mainSection>
            <section className="body">
              <p className="libre">
                <span className="outline">
                  Relevant
                </span> is a community of thought leaders fighting against <span className="outline">algorithmic oppression</span>.
                {'\n'}Do you have something to contribute?
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


        <panel className={'dark center'}>
          <img src={'/img/rWhite.svg'} />
          <div className={'libre pitch'}>
            At Relevant we are building an attention ecology that prioritises the qualitative aspects of attention.
            <br/><br/>
            With the Relevant news sharing app, we are experimenting with incentives that support curation of meaningful information, paving the way for a broad ecosystem for a new generation of apps and services that promote humanistic values. 
          </div>
        </panel>

        <panel className={'grey'}>
          <h1>A Promise Betrayed</h1>

          <columns>
            <div className={'innerPanel'}>

              <p>
                Once upon a time there was universal optimism about the internet. Every tech company’s mission was to make the world a better place — and for the most part, we believed them.
              </p>
              <p>
                The internet would revolutionize knowledge, social networks would spread democracy, automation would reduce inequality, and AI would accelerate the genius of the species.
              </p>
              <p className={'subH'}>
                What happened?
              </p>
              <p>
                Web 2.0 platforms had to adjust to the economic realities of running a business that offers free services. In order to raise income, centralized platforms began exploiting human nature to produce behaviour that was beneficial to their networks. This dynamic has led us to the current state of the attention economy. 
              </p>
            </div>
{/*
            <div className={'callout'}>
              <p>
                what you <b>measure</b><br/>determines<br/>what is <b>valuable</b>
              </p>
              <p>
                what is <b>valued</b><br/>determines<br/>what is <b>measured</b>
              </p>
            </div>

*/}
          </columns>


          <div className={'divider'}></div>
          <div className={'subH'}>Garbage in Garbage out</div>
          <p>Platforms do not measure behavior, they determine it</p>

          <div className={'divider'}></div>

          <div className={'subH'}>Perverse Incentive = Perverse Innovation</div>


        </panel>



        <panel>
          <h1>Attention Ecology</h1>
          <columns>
{/*          <div style={{ flex: 1 }}>
            <img src='/img/ecosystem.png'/>
          </div>*/}
          <div className={'innerPanel'}>
            <p>
              We don’t need to subscribe to a single economic reality anymore. With decentralized blockchain technology we can create new economic structures. There are now two degrees of freedom: economic incentives and user attention.
            </p>
            <p>
  Instead of manipulating user attention to extract capital, we are now able to structure incorruptible economic incentives that support humanistic values. 
            </p>
            <p>
            We now have the opportunity to focus on the qualitative side of attention - the attention ecology. 
            </p>
          </div>
          </columns>
        </panel>



        <panel className={'grey'}>
          <h1>Relevant News Reader</h1>

          <columns>

          <div className={'innerPanel'}>
            <p>
            Relevant news reader is our first step in the development of the Relevant Ecosystem.
            </p>
            <p>
As a collaborative result of the agency, engagement, and expertise of its users, relevant marries the social sharing of news articles with a knowledge project based on creating new values for online content.            </p>
            <p>
            It is currently in closed beta and available for both iOS and Android mobile devices. 
            </p>
            <p>
            The app serves as a lab for researching and experimenting with the Relevance metric and economic incentives.
            </p>
          </div>

          <div style={{ flex: .8 }}>
            <img src="/img/phone-upright.png"/>
          </div>
          </columns>

        </panel>

        <panel>
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
        </panel>


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
  actions: bindActionCreators(Object.assign({}, actionCreators), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Main);
