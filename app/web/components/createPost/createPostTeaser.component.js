import React from 'react';
import { Link, withRouter } from 'react-router';
import Avatar from '../common/avatar.component';

if (process.env.BROWSER === true) {
  require('./createPostTeaser.css');
}

function CreatePostTeaser(props) {
  if (!props.user) return null;
  return (
    <Link
      to={props.location.pathname + '#newpost'}
      className="createPostTeaser"
      role="button"
    >
      <Avatar size={44} user={props.user} nolink />
      <div className="textarea">
        {'Have you read anything good lately?'}
      </div>
    </Link>
  );
}

export default withRouter(CreatePostTeaser);
