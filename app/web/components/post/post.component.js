import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from 'react-router-redux';
import AvatarBox from '../common/avatarbox.component';
import PostButtons from './postbuttons.component';
import PostInfo from './postinfo.component';
import Tag from '../tag/tag.component';

import * as postActions from '../../../actions/post.actions';
import * as investActions from '../../../actions/invest.actions';
import * as createPostActions from '../../../actions/createPost.actions';

import Popup from '../common/popup';

class Post extends Component {
  static propTypes = {
    post: PropTypes.object,
    repost: PropTypes.object,
    link: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    showDescription: PropTypes.bool
  };

  deletePost() {
    // TODO custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    this.props.actions.deletePost(this.props.post);
  }

  editPost() {
    const { post, link } = this.props;
    this.props.actions.clearCreatePost();
    const editPost = {
      edit: true,
      editPost: post,
      postBody: post.body,
      postCategory: post.category,
      allTags: post.tags,
      selectedTags: post.tags,
      // do we need these here?
      postImage: link.image,
      postUrl: link.url,
      urlPreview: {
        title: link.title,
        url: link.url,
        image: link.image,
        domain: link.domain
      }
    };
    this.props.actions.setCreaPostState(editPost);
    this.props.actions.push(this.props.location.pathname + '#newpost');
  }

  render() {
    const { post, repost, link, auth } = this.props;
    const { community } = auth;

    let popup;

    if (post === 'notFound') {
      return (
        <div>
          <h1>Post not found</h1>
        </div>
      );
    }
    if (!post) return null;

    let postInfo;
    if (link) {
      postInfo = <PostInfo post={link} />;
    } else if (repost) {
      postInfo = <PostInfo post={repost} />;
    } else {
      postInfo = <PostInfo post={post} />;
    }

    let user = post.user || post.twitterUser;

    if (auth.user && auth.user._id === post.user) {
      popup = (
        <Popup
          options={[
            { text: 'Edit Post', action: this.editPost.bind(this) },
            { text: 'Delete Post', action: this.deletePost.bind(this) }
          ]}
        >
          <span className={'optionDots'}>...</span>
        </Popup>
      );
    }

    user = this.props.user.users[user] || user;

    if (user && !user._id) {
      user = post.embeddedUser;
    }

    // TODO better?
    if (!user && post.twitter) {
      user = post.embeddedUser;
    }

    const openPost = repost ? repost._id : post._id;

    return (
      <div
        className="post"
        onClick={() => this.props.actions.push('/' + community + '/post/' + openPost)}
      >
        {postInfo}
        <div className="postContent">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <AvatarBox
                user={user}
                auth={this.props.auth}
                date={post.postDate}
                repost={repost}
              />
              {popup}
            </div>

            <div className="postBody">
              <PostBody auth={this.props.auth} repost={repost} post={post} />
              {repost && (
                <div className="repostBody">
                  <AvatarBox
                    user={repost.embeddedUser}
                    auth={this.props.auth}
                    date={post.postDate}
                  />
                  <div>
                    <PostBody post={repost} />
                  </div>
                </div>
              )}

              {this.props.showDescription && (
                <div className="postDescription">{post.description}</div>
              )}
              <PostButtons post={post} {...this.props} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function PostBody(props) {
  const { body } = props.post;
  const tags = (props.post.tags || []).map(tag => (
    <Tag {...props} name={tag} key={tag} />
  ));
  return (
    <div className={props.repost ? 'repostText' : ''}>
      <pre>{body}</pre> {tags}
    </div>
  );
}

PostBody.propTypes = {
  post: PropTypes.object,
  repost: PropTypes.object
};

export default connect(
  () => ({}),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...createPostActions,
        ...routerActions,
        ...postActions,
        ...investActions
      },
      dispatch
    )
  })
)(Post);
