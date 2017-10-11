import React, { Component, PropTypes } from 'react';
import AvatarBox from '../common/avatarbox.component';
import PostButtons from './postbuttons.component';
import PostInfo from './postinfo.component';
import Tag from '../tag/tag.component'

class Post extends Component {
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
    const post = this.props.post;
    const repost = this.props.repost;
    const metaPost = this.props.metaPost;

    if (post === 'notFound') {
      return (<div><h1>Post not found</h1></div>);
    }
    if (!post) return null;

    // console.log(post)

    let postInfo;
    if (metaPost) {
      postInfo = (
        <PostInfo post={metaPost} />
      );
    }
    if (repost) {
      // console.log(repost)
      // console.log(this.props.posts.posts[post.repost.post])
      postInfo = (
        <PostInfo post={repost} />
      );
    } else {
      postInfo = (
        <PostInfo post={post} />
      );
    }

    let user = this.props.postUser || post.user

    return (
      <div className='post'>
        {postInfo}
        <div className='postContent'>
          <div className='postMeta'>
            <AvatarBox user={user} date={post.postDate} />
            {repost && (
              <AvatarBox user={user} date={post.postDate} isRepost/>
            )}
          </div>
          <div className='postBody'>
            {repost && (
              <div>
                <div className='repostBody'>
                  <PostBody post={repost} />
                </div>
                <div className='repostComment'>{post.repost.commentBody}</div>
              </div>
            )}
            {this.props.showDescription && (
              <div className='postDescription'>
                {post.description}
              </div>
            )}
            <PostBody post={post} />
          </div>
          <PostButtons post={post} {...this.props} />
        </div>
      </div>
    );
  }
}

function PostBody (props) {
  const body = props.post.body
  const tags = (props.post.tags || []).map( (tag) => {
    return (
      <Tag name={tag} key={tag} />
    )
  })
  return (
    <div>
      <span>{body}</span>
      {tags}
    </div>
  )
}
export default Post;
