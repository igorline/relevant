import React from 'react';
import { Link } from 'react-router';
import Loading from '../common/loading.component';

if (process.env.BROWSER === true) {
  require('./post.css');
}

export default function (props) {
  const { link, post } = props;

  if (post.loading) {
    return (
      <div className="postinfo loading">
        <Loading />
      </div>
    );
  }
  if (!post.title) {
    return (
      <div />
    );
  }

  let postImage = post.image ? {
    backgroundImage: 'url(' + post.image + ')',
  } : { backgroundColor: 'blue'};

  let small = props.small ? 'small' : '';
  let preview = props.preview ? 'preview' : '';

  const postContent = (
    <div className={'minimalPost postinfo ' + small + ' ' + preview}>
      <div className='image'><div style={postImage}></div></div>
      <div className={'headlineContainer'}>
        <h3 className="headline bebasRegular">{post.title}</h3>
        {post.domain &&
          <div className="domain">{post.domain}</div>
        }
      </div>
    </div>
  );

  if (link) {
    return <Link to={link} >{postContent}</Link>;
  }

  let url = post.url || post.link;

  if (url) {
    return (
      <a
        href={url}
        // onClick={e => e.stopPropagation()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {postContent}
      </a>
    );
  }
  return postContent;
}
