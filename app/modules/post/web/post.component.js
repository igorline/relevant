import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash.get';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import Popup from 'modules/ui/web/popup';
import styled from 'styled-components/primitives';
import { colors } from 'app/styles/globalStyles';
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
  /* border: 1px solid black; */
  padding: 1em;
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
  width: 100%;
  padding-bottom: 2em;
  border-bottom-color: ${colors.borderColor};
  border-bottom-style: solid;
  border-bottom-width: 1px;
`;

const Text = styled.Text`
`;

const StyledPostButtons = styled(PostButtons)`
  display: flex;
  background: orange;
  width: 200px;
  color: blue;
`;

const PostCommentContainer = styled(PostContainer)`
  // margin-bottom: 2em;
  margin-top: 1em;
  padding-left: 2em;
`;

export class Post extends Component {
  static propTypes = {
    post: PropTypes.shape({
      data: PropTypes.object
    }),
    postState: PropTypes.object,
    repost: PropTypes.object,
    link: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    showDescription: PropTypes.bool,
    history: PropTypes.object,
    usersState: PropTypes.object,
    sort: PropTypes.string,
  };

  deletePost() {
    // TODO: custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    this.props.actions.deletePost(this.props.post);
  }

  editPost() {
    const { post, link = {} } = this.props;
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
    const { post, repost, auth, sort, postState } = this.props;
    const { community } = auth;

    const link = postState.links[post.metaPost];
    let firstPost;
    if (post.new && post.new.length) {
      const firstPostId = post.new[post.new.length - 1];
      firstPost = postState.posts[firstPostId];
    }

    let popup;

    if (post === 'notFound') {
      return (
        <Wrapper>
          <Text>Post not found</Text>
        </Wrapper>
      );
    }
    if (!post) return null;


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

    const postUrl = `/${community}/post/${post._id}`;
    const commentId = get(post, `${sort}.0`);
    const comment = postState.posts[commentId];
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
              sort={sort}
              firstPost={firstPost}
            />
            <PostCommentContainer>
              <PostComment
                comment={comment}
                auth={this.props.auth}
                community={community}
              />
            </PostCommentContainer>
          </PostInfoContainer>
        </PostContainer>
      </Wrapper>
    );
  }
}

export default withRouter(connect(
  state => ({
    community: state.community.communities[state.community.active],
    usersState: state.user,
    sort: get(state.view, 'discover.sort'),
    postState: state.posts,
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
