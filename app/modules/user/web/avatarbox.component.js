import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import styled from 'styled-components';
import * as colors from 'app/styles/colors';
import Avatar from './avatar.component';

const Handle = styled.div`
  a {
    color: ${colors.secondaryText};
  }
  color: ${colors.secondaryText};
  font-size: 10px;
  font-family: Arial, sans-serif;
`;

export default function AvatarBox(props) {
  const { user, reverse } = props;
  if (!user) return null;
  const profileLink = user ? '/user/profile/' + user.handle : null;

  let timestamp;
  if (props.date) {
    timestamp = numbers.getTimestamp(Date.parse(props.date));
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
        <Handle>
          <Link to={profileLink} onClick={e => e.stopPropagation()}>
            @{user.handle}
          </Link>
          {timestamp}
        </Handle>
      </div>
      {reverse ? <Avatar auth={props.auth} user={user} /> : null}
    </div>
  );
}

AvatarBox.propTypes = {
  user: PropTypes.object,
  noPic: PropTypes.bool,
  auth: PropTypes.object,
  date: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  small: PropTypes.bool,
  topic: PropTypes.string,
  repost: PropTypes.object,
  reverse: PropTypes.bool,
  dontShowRelevance: PropTypes.bool
};
