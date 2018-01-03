import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

if (process.env.BROWSER === true) {
  require('./avatarbox.css');
}

export default class Avatar extends Component {
  render() {
    if (!this.props.user) return null;
    let profileLink = '/profile/' + this.props.user._id;
    // temp - not logged in - redirect to home
    if (this.props.auth && !this.props.auth.user) {
      profileLink = '/';
    }
    const avatarBackgroundImage = {
      backgroundImage: 'url(' + this.props.user.image + ')',
    };
    if (this.props.nolink) {
      return (
        <span
          className={'avatar'}
          style={avatarBackgroundImage}
        >
          {this.props.user.name}
        </span>
      );
    }
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
