import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Avatar from './avatar.component'

if (process.env.BROWSER === true) {
  require('./header.css');
}

class Header extends Component {
  render() {
    return (
      <header>
        <div></div>
        <div>
          <a href='/'><img src='/img/logo-white.svg' className='logo' alt='Relevant' /></a>
        </div>
        {this.renderLoginButton()}
      </header>
    );
  }

  renderLoginButton(){
    console.log(this.props.user)
    if (this.props.user) {
      return (
        <div className='right'>
          <a href='/logout'>Logout</a>
          <Avatar user={this.props.user} />
        </div>
      );
    }
    else {
      return (
        <div className='right'>
          <a href='/login'>Login</a>
        </div>
      );
    }
  }
}
//           <LoginButton user={this.props.user} />

const mapStateToProps = (state) => ({
  user: state.auth.user
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
