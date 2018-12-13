import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Loading from '../common/loading.component';

if (process.env.BROWSER === true) {
  require('./post.css');
}

export default function PostInfo(props) {
  const { link, post } = props;

  if (post.loading) {
    return (
      <div className="postinfo loading">
        <Loading />
      </div>
    );
  }
  if (!post.title) {
    return <div />;
  }

  const postImage = post.image
    ? {
      backgroundImage: 'url(' + post.image + ')'
    }
    : { backgroundColor: 'blue' };

  const small = props.small ? 'small' : '';
  const preview = props.preview ? 'preview' : '';

  const postContent = (
    <div style={{ position: 'relative' }}>
      <div className={'minimalPost postinfo ' + small + ' ' + preview}>
        <div className="image">
          <div style={postImage} />
        </div>
        <div className={'headlineContainer'}>
          <h3 className="headline bebasRegular">{post.title}</h3>
          {post.domain && <div className="domain">{post.domain}</div>}
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{postContent}</Link>;
  }

  const url = post.url || post.link;

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {postContent}
      </a>
    );
  }
  return postContent;
}

PostInfo.propTypes = {
  link: PropTypes.string,
  post: PropTypes.object,
  small: PropTypes.bool,
  preview: PropTypes.bool
};
