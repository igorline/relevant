import React from 'react';
import { Link } from 'react-router';
import { numbers } from '../../../utils';

import Avatar from './avatar.component';

export default function AvatarBox(props) {
  const user = props.user;
  let profileLink = '/profile/' + user._id;
  // temp - not logged in - redirect to home
  if (!props.auth.user) {
    profileLink = '/';
  }
  let timestamp;
  if (props.date) {
    timestamp = ' • ' + numbers.timeSince(Date.parse(props.date)) + ' ago';
  }
  let premsg;
  let className;
  if (props.isRepost) {
    className = 'repost';
    premsg = 'reposted by ';
  }
  if (props.topic) {
    timestamp = (
      <span>
        {' • '}
        <img src="/img/r-emoji.png" alt="R" className="r" />
        {Math.round(props.topic.relevance)}
        in
        #{props.topic.name}
      </span>
    );
  }
  let relevance;
  if (user.relevance && !props.dontShowRelevance) {
    relevance = (
      <span>
        <img src="/img/r-emoji.png" alt="R" className="r" />
        {Math.round(user.relevance)}
      </span>
    );
  }
  return (
    <div className={['avatarBox', className].join(' ')}>
      <Avatar auth={props.auth} user={user} />
      <div className="userBox">
        <div className="bebasRegular username">
          {premsg}
          <Link to={profileLink}>{user.name}</Link>
          {relevance}
        </div>
        <div className="gray">
          @<Link to={profileLink}>{user._id}</Link>
          {timestamp}
        </div>
      </div>
    </div>
  );
}
