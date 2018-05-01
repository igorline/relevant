import React from 'react';
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
    return <div ></div>;
  }

  let gradient = ['hsla(240, 70%, 30%, .01)',
    'hsla(240, 70%, 20%, .05)',
    'hsla(240, 70%, 10%, .2)',
    'hsla(240, 70%, 10%, .7)',
    'hsla(240, 70%, 10%, .6)'
  ]
  .join(',', ', ');

  let postImage = post.image ? {
    backgroundImage: 'linear-gradient(' + gradient + '), url(' + post.image + ')',
  } :
  { background: '#3E3EFF' };

  const postContent = (
    <div className="shadowBox postinfo" style={postImage}>
      <div>
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
        target="_blank"
        rel="noopener noreferrer"
      >
        {postContent}
      </a>
    );
  }

  return postContent;
}
