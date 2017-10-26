import React from 'react';

import Avatar from '../common/avatar.component';

if (process.env.BROWSER === true) {
  require('./createPostTeaser.css');
}

export default function CreatePostTeaser(props) {
  return (
    <div
      className="createPostTeaser"
      role="button"
      onClick={props.onClick}
    >
      <Avatar user={props.user} />
      <div className="textarea">
        {'What\'s relevant?'}
      </div>
      <button>Post</button>
    </div>
  );
}
