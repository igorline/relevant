import React from 'react';

if (process.env.BROWSER === true) {
  require('./post.css');
}

export default function (props) {
  const post = props.post;

  if (!post.title) {
    return (
      <div />
    );
  }

  const postImage = post.image && {
    backgroundImage: 'url(' + post.image + ')',
  };

  const postContent = (
    <div className="shadowBox postinfo">
      {post.image &&
        <span className="image" style={postImage} />
      }
      <div>
        <h3 className="headline bebasRegular">{post.title}</h3>
        {post.domain &&
          <div className="domain">{post.domain}</div>
        }
      </div>
    </div>
  );

  if (post.url) {
    return (
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {postContent}
      </a>
    );
  }
  return postContent;
}
