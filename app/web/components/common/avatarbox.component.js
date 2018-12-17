import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { numbers } from '../../../utils';

import Avatar from './avatar.component';

export default function AvatarBox(props) {
  const { user, reverse } = props;
  if (!user) return null;
  const profileLink = user ? '/user/profile/' + user.handle : null;

  let timestamp;
  if (props.date) {
    timestamp = ' • ' + numbers.timeSince(Date.parse(props.date)) + ' ago';
  }
  let premsg;
  let className = reverse ? 'reverse ' : '';
  if (props.repost) {
    className = 'repost';
    premsg = 'reposted by ';
  }
  if (props.small) {
    className += ' small';
  }
  if (props.topic) {
    timestamp = (
      <span>
        {' • '}
        <img src="/img/r-emoji.png" alt="R" className="r" />
        {Math.round(props.topic.relevance)}
        in #{props.topic.name}
      </span>
    );
  }
  let relevance;
  if (user.relevance && !props.dontShowRelevance) {
    relevance = (
      <span>
        <span
          style={{ backgroundImage: 'url(/img/r-emoji.png)' }}
          alt="R"
          className="r"
        />
        {Math.round(user.relevance.pagerank)}
      </span>
    );
  }
  return (
    <div className={['avatarBox', className].join(' ')}>
      {!reverse && !props.noPic ? <Avatar auth={props.auth} user={user} /> : null}
      <div className="userBox">
        <div className="bebasRegular username">
          {premsg}
          <Link onClick={e => e.stopPropagation()} to={profileLink}>
            {user.name}
          </Link>
          {relevance}
        </div>
        <div className="gray">
          @
          <Link to={profileLink} onClick={e => e.stopPropagation()}>
            {user.handle}
          </Link>
          {timestamp}
        </div>
      </div>
      {reverse ? <Avatar auth={props.auth} user={user} /> : null}
    </div>
  );
}

AvatarBox.propTypes = {
  user: PropTypes.object,
  noPic: PropTypes.bool,
  auth: PropTypes.object,
  date: PropTypes.string,
  small: PropTypes.bool,
  topic: PropTypes.string,
  repost: PropTypes.object,
  reverse: PropTypes.bool,
  dontShowRelevance: PropTypes.bool
};
