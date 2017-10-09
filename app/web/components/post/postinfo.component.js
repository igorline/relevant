import React, {
  PropTypes
} from 'react';
// import { Motion, spring, presets } from 'react-motion';
import { Link } from 'react-router';

if (process.env.BROWSER === true) {
  require('./post.css');
}

export default function (props) {
  const post = props.post

  const postImage = {
    backgroundImage: post.image ? 'url(' + post.image + ')' : 'none'
  };

  if (post.link) {
    return (
      <a
        className={'postinfo'}
        href={post.link}
        target='_blank'
      >
        <div className='shadowBox postinfo'>
          <span className='image' alt={post.title} style={postImage} />
          <div>
            <h3 className='headline bebasRegular'>{post.title}</h3>
            <div className='domain'>{post.domain}</div>
          </div>
        </div>
      </a>
    )
  }
  else if (post.title) {
    <div className='shadowBox postinfo'>
      <div>
        <h3 className='headline bebasRegular'>{post.title}</h3>
      </div>
    </div>
  }
  else {
    return null;
  }
}
