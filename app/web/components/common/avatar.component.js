import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

if (process.env.BROWSER === true) {
  require('./avatarbox.css');
}

export default class Avatar extends Component {
  render() {
    const profileLink = '/profile/' + this.props.user.id;
    const avatarBackgroundImage = {
      backgroundImage: 'url(' + this.props.user.image + ')',
    };
    return (
      <a className='avatar' href={profileLink} style={avatarBackgroundImage}>{this.props.user.name}</a>
    );
  }
}
