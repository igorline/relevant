import React, { Component, PropTypes } from 'react';

class PostButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
  }

  render() {
    let post = this.props.post;

    if (post === 'notFound') {
      return null;
    }
    if (!post) return null;

    return (
      <div className='postbuttons'>
        <div className='left'>
          <a href='#'><img src='/img/upvote-shadow.svg' /></a>
          <div className='fraction'>
            <div className='num'>
              {post.upVotes + post.downVotes}
            </div>
            <div className='dem'>
              {post.relevance}
              <img src='/img/r-gray.svg' />
            </div>
          </div>
          <a href='#'><img src='/img/downvote-gray.svg' /></a>
        </div>
        <div className='right'>
          <div className='commentcount'>
            <img src='/img/comment.svg' />
            <span>{post.commentCount}</span>
          </div>
          <a href='#'><img src='/img/share.svg' /></a>
        </div>
      </div>
    );
  }
}
export default PostButtons;
