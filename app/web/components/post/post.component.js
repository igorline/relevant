import React, { Component, PropTypes } from 'react';
import AvatarBox from '../common/avatarbox.component';
import PostButtons from './postbuttons.component';
import PostInfo from './postinfo.component';
import Tag from '../tag/tag.component';

class Post extends Component {
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
    } else if (repost) {
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

    let user = this.props.postUser || post.user;
    if (user && !user.name) {
      user = {};
      user._id = post.user;
      user.image = post.embeddedUser.image;
      user.name = post.embeddedUser.name;
    }
    if (!user && post.twitter) {
      user = post.embeddedUser;
    }

    return (
      <div className="post">
        {postInfo}
        <div className="postContent">
          <div className="postMeta">
            <AvatarBox user={user} auth={this.props.auth} date={post.postDate} />
            {repost && (
              <AvatarBox user={user} auth={this.props.auth} date={post.postDate} isRepost />
            )}
          </div>
          <div className="postBody">
            {repost && (
              <div>
                <div className="repostBody">
                  <PostBody post={repost} />
                </div>
                <div className="repostComment">{post.repost.commentBody}</div>
              </div>
            )}
            {this.props.showDescription && (
              <div className="postDescription">
                {post.description}
              </div>
            )}
            <PostBody auth={this.props.auth} post={post} />
          </div>
          <PostButtons post={post} {...this.props} />
        </div>
      </div>
    );
  }
}

function PostBody(props) {
  const body = props.post.body;
  const tags = (props.post.tags || []).map((tag) => (
    <Tag {...props} name={tag} key={tag} />
    ));
  return (
    <div>
      <span>{body}</span>
      {tags}
    </div>
  );
}
export default Post;
