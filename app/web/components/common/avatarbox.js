import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { numbers } from '../../../utils';
import Avatar from './avatar';

export default class AvatarBox extends Component {
  render() {
    const user = this.props.user
    const profileLink = '/profile/' + user.id;
    let timestamp;
    if (this.props.date) {
      timestamp = '· ' + numbers.timeSince(Date.parse(this.props.date));
    }
    return (
      <div className='avatarBox'>
        <Avatar user={user} />
        <div className='userBox'>
          <a href={profileLink}>{user.name}</a><br />
          <span class='gray'>@{user._id} {timestamp}</span>
        </div>
      </div>
    );
  }
}
