import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as animationActions from 'modules/animation/animation.actions';
import styled from 'styled-components/primitives';
import { sizing } from 'app/styles';
import SingleComment from 'modules/comment/web/singleComment.container';
import PostButtons from 'modules/post/postbuttons.component';
import PostInfo from 'modules/post/postinfo.component';
import { routing } from 'app/utils';
import { View, Text, Divider } from 'modules/styled/uni';

const PostButtonContainer = styled.View`
  width: ${sizing(12)};
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
    noComments: PropTypes.bool,
    firstPost: PropTypes.object,
    comment: PropTypes.object,
    children: PropTypes.object,
    hideDivider: PropTypes.bool,
    hidePostButtons: PropTypes.bool
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
    const {
      post,
      auth,
      sort,
      noComments,
      link,
      firstPost,
      hideDivider,
      hidePostButtons,
      comment
    } = this.props;
    const { community } = auth;

    const isLink = post.type === 'link';

    if (post === 'notFound') {
      return (
        <View>
          <Text>Post not found</Text>
        </View>
      );
    }
    if (!post) return null;

    const postUrl = routing.getPostUrl(community, post);

    // TODO pass post buttons as prop to Post?
    const postEl = isLink ? (
      <View fdirection={'row'} m="4 4 0 0">
        {!hidePostButtons && (
          <PostButtonContainer>
            <PostButtons post={post} {...this.props} />
          </PostButtonContainer>
        )}
        <View flex={1}>
          <PostInfo
            post={post}
            link={link}
            community={community}
            postUrl={postUrl}
            sort={sort}
            firstPost={firstPost}
          />
          {this.props.children}
        </View>
      </View>
    ) : (
      <SingleComment comment={post} postUrl={postUrl} parentPost={post} hideBorder />
    );

    const commentEl =
      !noComments && comment ? (
        <SingleComment
          comment={comment}
          postUrl={postUrl}
          parentPost={post}
          hidePostButtons
          hideBorder
          nestingLevel={1.5}
        />
      ) : null;

    return (
      <View fdirection={'column'} m="0 0 0 0">
        {postEl}
        {commentEl}
        {!hideDivider && <Divider mt="4" ml={4} mr={4} />}
      </View>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      community: state.community.communities[state.community.active],
      usersState: state.user,
      auth: state.auth,
      earnings: state.earnings,
      myPostInv: state.investments.myPostInv
    }),
    dispatch => ({
      actions: bindActionCreators(
        {
          ...createPostActions,
          ...postActions,
          ...investActions,
          ...animationActions
        },
        dispatch
      )
    })
  )(Post)
);
