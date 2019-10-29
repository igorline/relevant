import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { layout } from 'app/styles';
import * as commentActions from 'modules/comment/comment.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as animationActions from 'modules/animation/animation.actions';
import { Divider, View } from 'modules/styled/uni';
import CommentForm from './commentForm.component';
import Comment from './comment.component';

class Comments extends Component {
  static propTypes = {
    actions: PropTypes.object,
    match: PropTypes.object,
    comments: PropTypes.object,
    posts: PropTypes.object,
    auth: PropTypes.object,
    post: PropTypes.object,
    myPostInv: PropTypes.object,
    user: PropTypes.object,
    screenSize: PropTypes.number
  };

  state = {
    activeComment: null
  };

  setActiveComment = commentId => {
    const activeComment = this.state.activeComment === commentId ? null : commentId;
    this.setState({ activeComment });
  };

  scrollTo = (x, y) => {
    const paddingY = window.outerHeight / 4;
    window.scrollTo(x, y - paddingY);
  };

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  render() {
    const {
      comments,
      posts,
      post,
      auth,
      actions,
      myPostInv,
      user,
      match,
      screenSize
    } = this.props;
    const children = comments.childComments[post._id] || [];
    const focusedComment = get(match, 'params.commentId', null);
    return (
      <div>
        <CommentForm
          nestingLevel={0}
          additionalNesting={screenSize ? 0 : layout.POST_BUTTONS_NESTING_UNITS}
          buttonText={'Comment'}
          parentPost={post}
          p={['0 4 4 4', '4 2 2 2']}
        />
        {children.length !== 0 ? (
          <div>
            {children.map(id => {
              const comment = posts.posts[id];
              if (!comment) return null;
              return (
                <View key={id}>
                  <Divider m={['0 4', 0]} screenSize={screenSize} />
                  <Comment
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
                    parentPost={post}
                    nestingLevel={0}
                    actions={actions}
                    focusedComment={focusedComment}
                    scrollTo={this.scrollTo}
                    screenSize={screenSize}
                  />
                </View>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      auth: state.auth,
      comments: state.comments,
      myPostInv: state.investments.myPostInv,
      user: state.user,
      screenSize: state.navigation.screenSize
    }),
    dispatch => ({
      actions: bindActionCreators(
        {
          ...commentActions,
          ...createPostActions,
          ...investActions,
          ...animationActions
        },
        dispatch
      )
    })
  )(Comments)
);
