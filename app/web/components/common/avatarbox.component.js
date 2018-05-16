import React from 'react';
import { Link } from 'react-router';
import { numbers } from '../../../utils';

import Avatar from './avatar.component';

export default function AvatarBox(props) {
  const user = props.user;
  const reverse = props.reverse;
  let profileLink = user ? '/profile/' + user.handle : null;

  let timestamp;
  if (props.date) {
    timestamp = ' • ' + numbers.timeSince(Date.parse(props.date)) + ' ago';
  }
  let premsg;
  let className = reverse ? 'reverse ' : '';
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
      { !reverse ? <Avatar auth={props.auth} user={user} /> : null}
      <div className="userBox">
        <div className="bebasRegular username">
          {premsg}
          <Link onClick={e => e.stopPropagation()} to={profileLink}>{user.name}</Link>
          {relevance}
        </div>
        <div className="gray">
          @<Link to={profileLink} onClick={e => e.stopPropagation()}
>{user.handle}</Link>
          {timestamp}
        </div>
      </div>
      { reverse ? <Avatar auth={props.auth} user={user} /> : null}
    </div>
  );
}
