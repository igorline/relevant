import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import AvatarBox from 'modules/user/web/avatarbox.component';
// import AvatarBox from 'modules/user/avatarbox.component.styled';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import Popup from 'modules/ui/web/popup';
import styled from 'styled-components/primitives';
import PostComment from 'modules/post/web/postComment.component';
import PostButtons from './postbuttons.component';
import PostInfo from './postinfo.component';


const Wrapper = styled.View`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid black;
`;

const PostContainer = styled.View`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const PostInfoContainer = styled.View`
  display: flex;
  position: relative;
  flex-shrink: 1;
`;

const StyledPostButtons = styled(PostButtons)`
  display: flex;
  background: orange;
`;

const PostCommentContainer = styled(PostContainer)`
  margin-bottom: 2em;
  margin-left: 4em;
`;

class Post extends Component {
  static propTypes = {
    post: PropTypes.shape({
      data: PropTypes.object
    }),
    repost: PropTypes.object,
    link: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    showDescription: PropTypes.bool,
    history: PropTypes.object,
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
    this.props.actions.setCreatePostState(editPost);
    this.props.history.push(this.props.location.pathname + '#newpost');
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

    // let postInfo;
    // if (link) {
    //   postInfo = <PostInfo post={link} date={post.postDate} user={post.embeddedUser} />;
    // }

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

    user = this.props.user.users[user] || post.embeddedUser;

    // if (user && !user._id) {
    //   user = post.embeddedUser;
    // }
    // // TODO better?
    // if (!user && post.twitter) {
    //   user = post.embeddedUser;
    // }

    const openPost = repost ? repost._id : post._id;
    const postUrl = `/${community}/post/${openPost}`;
    return (
      <Wrapper>
        <PostContainer>
          <StyledPostButtons post={post} {...this.props} />
          <PostInfoContainer>
            <PostInfo
              post={post}
              link={link}
              community={community}
              postUrl={postUrl}
            />
          </PostInfoContainer>
        </PostContainer>

      </Wrapper>
    );
  }
}

// <PostCommentContainer>
//   <PostComment
//     auth={this.props.auth}
//     community={community}
//     repost={repost}
//     post={post}
//     date={post.postDate}
//   />
// </PostCommentContainer>

// <PostComment
//   auth={this.props.auth}
//   community={community}
//   repost={repost}
//   post={post}
//   date={post.postDate}
// />

// <PostComment
//   auth={this.props.auth}
//   community={community}
//   repost={repost}
//   post={post}
//   date={post.postDate}
// />

export default withRouter(connect(
  state => ({
    community: state.community.communities[state.community.active]
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...createPostActions,
        ...postActions,
        ...investActions
      },
      dispatch
    )
  })
)(Post));
