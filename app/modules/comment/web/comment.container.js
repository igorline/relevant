import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as commentActions from 'modules/comment/comment.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import styled from 'styled-components/primitives';
import { sizing, colors } from 'app/styles';
import CommentForm from './commentForm.component';
import Comment from './comment.component';

const FormContainer = styled.View`
  padding: ${sizing(4)};
  padding-left: ${sizing(12)};
  background-color: ${colors.secondaryBG};
`;

if (process.env.BROWSER === true) {
  require('./comment.css');
}

class Comments extends Component {
  static propTypes = {
    actions: PropTypes.object,
    match: PropTypes.object,
    comments: PropTypes.object,
    posts: PropTypes.object,
    auth: PropTypes.object,
    post: PropTypes.object,
    myPostInv: PropTypes.object,
    user: PropTypes.object
  };

  state = {
    activeComment: null
  };

  componentDidMount() {
    const { params } = this.props.match;
    this.props.actions.getComments(params.id);
  }

  setActiveComment = commentId => {
    const activeComment = this.state.activeComment === commentId ? null : commentId;
    this.setState({ activeComment });
  };

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  render() {
    const { comments, posts, post, auth, actions, myPostInv, user } = this.props;
    const children = comments.childComments[post._id] || [];
    return (
      <div>
        <FormContainer>
          <CommentForm text={'Reply'} {...this.props} parentPost={post} />
        </FormContainer>
        {children.length !== 0 ? (
          <div>
            {children.map(id => {
              const comment = posts.posts[id];
              if (!comment) return null;
              return (
                <Comment
                  key={id}
                  auth={auth}
                  comment={comment}
                  actions={actions}
                  myPostInv={myPostInv}
                  user={user}
                  activeComment={this.state.activeComment}
                  setActiveComment={this.setActiveComment}
                  parentPost={post._id}
                  childComments={comments.childComments}
                  posts={posts}
                  post={post}
                  nesting={0}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    comments: state.comments,
    myPostInv: state.investments.myPostInv,
    user: state.user
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...commentActions,
        ...createPostActions,
        ...investActions
      },
      dispatch
    )
  })
)(Comments);
