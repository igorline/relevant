import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import styled from 'styled-components/primitives';
import { colors, sizing } from 'app/styles';
import PostComment from 'modules/post/web/postComment.component';
import PostButtons from 'modules/post/postbuttons.component';
import PostInfo from 'modules/post/postinfo.component';

const Wrapper = styled.View`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding-bottom: ${sizing(4)};
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
  padding-bottom: ${(p) => p.detailView ? '' : sizing(4)};
  border-bottom-color: ${colors.lineColor};
  border-bottom-style: solid;
  border-bottom-width: 1px;
`;

const Text = styled.Text`
`;

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
    detailView: PropTypes.bool,
    firstPost: PropTypes.object,
    comment: PropTypes.object,
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
    const { post, auth, sort, detailView, link, firstPost, comment } = this.props;
    const { community } = auth;

    if (post === 'notFound') {
      return (
        <Wrapper>
          <Text>Post not found</Text>
        </Wrapper>
      );
    }
    if (!post) return null;

    const postUrl = `/${community}/post/${post._id}`;


    return (
      <Wrapper detailView={detailView}>
        <PostContainer>
          <PostButtonContainer>
            <PostButtons post={post} {...this.props} />
          </PostButtonContainer>
          <PostInfoContainer detailView={detailView}>
            <PostInfo
              post={post}
              link={link}
              community={community}
              postUrl={postUrl}
              sort={sort}
              firstPost={firstPost}
            >
              {!detailView &&
              <PostComment
                comment={comment}
                auth={this.props.auth}
                community={community}
                postUrl={postUrl}
              />
              }
            </ PostInfo>
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
    auth: state.auth,
    earnings: state.earnings,
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
