import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

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
      const profileLink = '/profile/' + this.props.user.name;
      const avatarBackgroundImage = {
        'background-image': 'url(' + this.props.user.image + ')',
      };
      return (
        <div className='right'>
          <a href='/logout'>Logout</a>
          <a href={profileLink} className='avatar' style={avatarBackgroundImage}>Profile</a>
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
