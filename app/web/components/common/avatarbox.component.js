import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { numbers } from '../../../utils';
import { Link } from 'react-router';

import Avatar from './avatar.component';

export default class AvatarBox extends Component {
  render() {
    const user = this.props.user
    const profileLink = '/profile/' + user._id;
    let timestamp;
    if (this.props.date) {
      timestamp = ' • ' + numbers.timeSince(Date.parse(this.props.date)) + ' ago';
    }
    let premsg, className;
    if (this.props.isRepost) {
      className = 'repost';
      premsg = 'reposted by ';
    }
    if (this.props.topic) {
      timestamp = (
        <span>
          {' • '}
          <img src='/img/r-emoji.png' className='r' />
          {Math.round(this.props.topic.relevance)}
          in
          #{this.props.topic.name}
        </span>
      )
    }
    let relevance;
    if (user.relevance && ! this.props.dontShowRelevance) {
      relevance = (
        <span>
          <img src='/img/r-emoji.png' className='r' />
          {Math.round(user.relevance)}
        </span>
      );
    }
    return (
      <div className={['avatarBox', className].join(' ')}>
        <Avatar user={user} />
        <div className='userBox'>
          <div className='bebasRegular username'>
            {premsg}
            <Link to={profileLink}>{user.name}</Link>
            {relevance}
          </div>
          <div className='gray'>
            @<Link to={profileLink}>{user._id}</Link>
            {timestamp}
          </div>
        </div>
      </div>
    );
  }
}
