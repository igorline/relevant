import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

if (process.env.BROWSER === true) {
  require('./avatarbox.css');
}

export default class Avatar extends Component {
  render() {
    if (!this.props.user) return null;
    let profileLink = '/user/profile/' + this.props.user._id;

    let image = this.props.user.image || '/img/default_user.jpg';
    const avatarBackgroundImage = {
      backgroundImage: 'url(' + image + ')',
      width: this.props.size,
      height: this.props.size,
    };
    if (this.props.nolink) {
      return (
        <span
          className={'avatar'}
          style={avatarBackgroundImage}
        >
          {this.props.noName ? null : this.props.user.name}
        </span>
      );
    }
    return (
      <Link
        onClick={e => e.stopPropagation()}
        className={'avatar'}
        to={profileLink}
        style={avatarBackgroundImage}
      >
        {this.props.noName ? null : this.props.user.name}
      </Link>
    );
  }
}
