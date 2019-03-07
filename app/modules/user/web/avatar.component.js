import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class Avatar extends Component {
  static propTypes = {
    user: PropTypes.object,
    size: PropTypes.number,
    nolink: PropTypes.bool,
    noName: PropTypes.bool
  };

  render() {
    if (!this.props.user) return null;
    const profileLink = '/user/profile/' + this.props.user.handle;

    const image = this.props.user.image || '/img/default_user.jpg';
    const avatarBackgroundImage = {
      backgroundImage: 'url(' + image + ')',
      width: this.props.size,
      height: this.props.size
    };
    if (this.props.nolink) {
      return (
        <span className={'avatar'} style={avatarBackgroundImage}>
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
