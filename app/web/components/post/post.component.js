import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AvatarBox from '../common/avatarbox.component';
import PostButtons from './postbuttons.component';
import PostInfo from './postinfo.component';
import Tag from '../tag/tag.component';

import * as routerActions from 'react-router-redux';
import * as postActions from '../../../actions/post.actions';
import * as investActions from '../../../actions/invest.actions';
import * as createPostActions from '../../../actions/createPost.actions';

import Popup from '../common/popup';

class Post extends Component {
  static propTypes = {
    post: PropTypes.object,
    repost: PropTypes.object,
    metaPost: PropTypes.object,
  }
  deletePost() {
    // TODO custom confirm
    let okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return null;
    this.props.actions.deletePost(this.props.post);
  }
  editPost(e) {
    let post = this.props.post;
    this.props.actions.clearCreatePost();
    let editPost = {
      edit: true,
      editPost: post,
      postBody: post.body,
      postCategory: post.category,
      allTags: post.tags,
      postImage: post.image,
      postUrl: post.link,
      selectedTags: post.tags,
      urlPreview: {
        title: post.title,
        url: post.link,
        image: post.image,
        domain: post.domain
      }
    };
    this.props.actions.setCreaPostState(editPost);

    this.props.actions.push(this.props.location.pathname + '#newpost');
  }
  render() {
    const post = this.props.post;
    const repost = this.props.repost;
    const metaPost = this.props.metaPost;
    const auth = this.props.auth;
    let popup;

    if (post === 'notFound') {
      return (<div><h1>Post not found</h1></div>);
    }
    if (!post) return null;

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

    let user = post.user || post.twitterUser;

    if (auth.user && auth.user._id === post.user) {
      popup = (
        <Popup
          options={[
            { text: 'Edit Post', action: this.editPost.bind(this) },
            { text: 'Delete Post', action: this.deletePost.bind(this) },
          ]}
        >
          <span className={'optionDots'}>...</span>
        </Popup>
      );
    }

    user = this.props.user.users[user] || user;

    if (user && !user._id) {
      user = {};
      user._id = post.user;
      user.image = post.embeddedUser.image;
      user.name = post.embeddedUser.name;
      user.relevance = post.embeddedUser.relevance.relevance;
      user.handle = post.embeddedUser.handle;
    }
    if (!user && post.twitter) {
      user = post.embeddedUser;
    }

    return (
      <div
        className="post"
        onClick={() => this.props.actions.push('/post/' + post._id)}
      >
        {postInfo}
        <div className="postContent">

{/*          <div className="postMeta">
          </div>*/}

          <div style={{ flex: 1 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <AvatarBox user={user} auth={this.props.auth} date={post.postDate} />
              {repost && (
                <AvatarBox user={user} auth={this.props.auth} date={post.postDate} isRepost />
              )}
              {popup}
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
              <PostButtons post={post} {...this.props} />
            </div>
          </div>
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

export default connect(
  state => ({
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...createPostActions,
      ...routerActions,
      ...postActions,
      ...investActions,
    }, dispatch)
  })
)(Post);
// export default Post;
