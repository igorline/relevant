import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShadowButton from '../ShadowButton';
import Modal from '../modal';
import * as actionCreators from '../../../actions/auth.actions';
import * as socketActions from '../../actions/socket';

export class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderMarquee = this.renderMarquee.bind(this);
    this.animate = this.animate.bind(this);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.close = this.close.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      modal: false,
    };
    this.email;
    this.username;
    this.password;
    this.x = {
      0: 0,
      1: 0,
      2: 0,
    };
    this.marqueeData = [
      [{ name: 'berniesanders', change: -55 }, { name: 'megynkelly', change: 110 }, { name: 'demnagvasalia', change: 66 }, { name: 'troyesivan', change: 50 }, { name: 'lilymcmenamy', change: 10 }, { name: 'berniesanders', change: -55 }, { name: 'megynkelly', change: 110 }, { name: 'demnagvasalia', change: 66 }, { name: 'troyesivan', change: 50 }, { name: 'lilymcmenamy', change: 10 }],
      [{ name: '21savage', change: -44 }, { name: 'lilyrosedepp', change: 99 }, { name: 'pamanderson', change: 88 }, { name: 'chelseahandler', change: 20 }, { name: 'nicolerichie', change: -10 }, { name: '21savage', change: -44 }, { name: 'lilyrosedepp', change: 99 }, { name: 'pamanderson', change: 88 }, { name: 'chelseahandler', change: 20 }, { name: 'nicolerichie', change: -10 }],
     [{ name: 'blacchyna', change: -7.2 }, { name: 'virgilabloh', change: 99 }, { name: 'khloekardashian', change: 6 }, { name: 'riccardotisci', change: -110 }, { name: 'alanachampion', change: 200 }, { name: 'blacchyna', change: -7.2 }, { name: 'virgilabloh', change: 99 }, { name: 'khloekardashian', change: 6 }, { name: 'riccardotisci', change: -110 }, { name: 'alanachampion', change: 200 }],
    ];
    this.dataBlock = {};
    this.innerEls = {};
    this.widths = [];
    this.iteration = 0;
  }

  componentDidMount() {
    this.renderMarquee(true);
  }

  animate() {
    let now = new Date();
    let elapsed = 0;
    if (this.lastTime) elapsed = now - this.lastTime;
    elapsed /= 10;
    this.x = [
      this.x[0] -= 0.5 * elapsed,
      this.x[1] -= 1 * elapsed,
      this.x[2] -= 0.7 * elapsed,
    ];
    this.x = this.x.map((x, i) => {
      let w = document.getElementsByClassName('m' + i)[0].offsetWidth / 2;
      if (x <= -w) x += w;
      this.dataBlock[i].style.transform = 'translateX(' + x + 'px) translateZ(0px)';
      return x;
    });
    this.lastTime = now;
    window.requestAnimationFrame(() => this.animate());
  }

  renderMarquee(initial) {
    if (!this.marqueeData) return;
    this.marqueeData.forEach((data, i) => {
      if (initial) this.innerEls[i] = [];
      data.forEach((innerData, j) => {
        let color = i === 1 ? 'black' : '#EDEDED';
        let userData = ([
          <p style={{ color }}>{innerData.name}</p>,
          <p style={{ color }}>{innerData.change > 0 ? '▲' : '▼'}</p>,
          <p style={{ color }}>{innerData.change}%</p>
        ]);
        let specialKey = JSON.stringify(j) + JSON.stringify(i) + JSON.stringify(this.iteration);
        let singleEl = (<div key={specialKey} className="bebasRegular">{userData}</div>);
        this.innerEls[i].push(singleEl);
      });
    });
    this.setState({});
    this.iteration++;
    if (initial) {
      this.animate();
      this.renderMarquee();
    }
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    console.log('submit', this.email);
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
    return (
      <div className="splashContainer">

        <div className="marqueeParent">
          <article style={{ backgroundColor: 'black' }}>
            <section
              className="m0"
              style={{ transform: `translateX(${this.x[0]}px)` }}
              ref={(c) => { this.dataBlock[0] = c; }}
            >
              {this.innerEls[0]}
            </section>
          </article>
          <article style={{ backgroundColor: '#EDEDED' }}>
            <section
              className="m1"
              style={{ transform: `translateX(${this.x[1]}px)` }}
              ref={(c) => { this.dataBlock[1] = c; }}
            >
              {this.innerEls[1]}
            </section>
          </article>
          <article style={{ backgroundColor: 'black' }}>
            <section
              className="m2"
              style={{ transform: `translateX(${this.x[2]}px)` }}
              ref={(c) => { this.dataBlock[2] = c; }}
            >
              {this.innerEls[2]}
            </section>
          </article>
        </div>

        <div className="loginBar">
          <p>beta tester?</p>
          <a style={{ cursor: 'pointer' }} onClick={() => this.setState({ modal: !this.state.modal })}>
            login to post
          </a>
        </div>

        <div className="splashContent">
          <img src="/img/phone.png" alt="phone" className="phone" />
          <section className="header">
            <img src="/img/logo.svg" alt="logo" />
          </section>
          <div className="divider" />
          <section className="body">
            <p className="libre">
              <span className="outline">
                Relevant
              </span> is sit amet, consectetur adipiscing elit, eiusmod tempor incididunt <span className="outline">labore et</span> dolore magna aliqua ad minim.
              {/* <a href="http://www.apple.com" className="download">
                <img src="/img/apple.png" />
                <span className="bebasRegular">download</span>
              </a> */}
            </p>
          </section>
          <section className="invitation">
            <p>
              Sign up for your <br />invitation to Relevant.
            </p>
          </section>
          <section className="form">
            <input
              className="blueInput"
              value={this.email}
              onChange={(email) => {
                this.email = email.target.value;
                // this.handleChange('email', email.target.value);
              }}
              type="text"
              name="email"
              placeholder="Your email"
            />
            <ShadowButton text={'Submit'} color={'#3E3EFF'} action={this.submit} />
          </section>
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
        <Modal visible={this.state.modal} close={this.close}>
          <p className="loginText">login</p>
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
          <ShadowButton backgroundColor={'white'} text={'Login'} color={'#3E3EFF'} action={this.login} />
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
