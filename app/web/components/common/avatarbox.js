import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { numbers } from '../../../utils';
import Avatar from './avatar';

export default class AvatarBox extends Component {
  render() {
    const user = this.props.user
    const profileLink = '/profile/' + user._id;
    let timestamp;
    if (this.props.date) {
      timestamp = ' · ' + numbers.timeSince(Date.parse(this.props.date));
    }
    if (this.props.topic) {
      timestamp = (
        <span>
          <img src='/img/r-emoji.png' className='r' />
          {Math.round(this.props.topic.relevance)}
          in
          #{this.props.topic.name}
        </span>
      )
    }
    return (
      <div className='avatarBox'>
        <Avatar user={user} />
        <div className='userBox'>
          <div className='bebasRegular username'>
            <a href={profileLink}>{user.name}</a>
            <img src='/img/r-emoji.png' className='r' />
            {Math.round(user.relevance)}
          </div>
          <div className='gray'>
            @<a href={profileLink}>{user._id}</a>
            {timestamp}
          </div>
        </div>
      </div>
    );
  }
}
