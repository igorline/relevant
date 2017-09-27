import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

if (process.env.BROWSER === true) {
  require('./avatarbox.css');
}

export default class Avatar extends Component {
  render() {
    const profileLink = '/profile/' + this.props.user._id;
    const avatarBackgroundImage = {
      backgroundImage: 'url(' + this.props.user.image + ')',
    };
    return (
      <Link
        className={'avatar'}
        to={profileLink}
        style={avatarBackgroundImage}
      >
        {this.props.user.name}
      </Link>
    );
  }
}
