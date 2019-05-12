import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { layout } from 'app/styles';
import * as commentActions from 'modules/comment/comment.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as animationActions from 'modules/animation/animation.actions';
import { View, Spacer } from 'modules/styled/uni';
// import Comment from 'modules/comment/web/comment.component';
import Loading from 'modules/ui/web/loading.component';
import ChatMessage from 'modules/chat/web/chatMessage.component';

// import InfScroll from 'modules/listview/web/infScroll.component';

class ChatLog extends Component {
  static propTypes = {
    actions: PropTypes.object,
    match: PropTypes.object,
    comments: PropTypes.object,
    posts: PropTypes.object,
    auth: PropTypes.object,
    post: PropTypes.object,
    myPostInv: PropTypes.object,
    user: PropTypes.object,
    screenSize: PropTypes.number,
    pendingComments: PropTypes.object
  };

  state = {
    activeComment: null
  };

  componentDidMount() {
    const { params } = this.props.match;
    this.props.actions.getComments(params.id, 0, 0, true);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  setActiveComment = commentId => {
    const activeComment = this.state.activeComment === commentId ? null : commentId;
    this.setState({ activeComment });
  };

  scrollTo = (x, y) => {
    const paddingY = window.outerHeight / 4;
    this.el.scrollTo(x, y - paddingY);
  };

  scrollToBottom() {
    this.el.scrollTo(0, this.el.scrollHeight);
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
      screenSize,
      pendingComments
    } = this.props;
    const children = [
      ...(comments.childComments[post._id] || []).sort().map(id => posts.posts[id])
    ];
    const pending = [...(pendingComments[post._id] || [])];
    const focusedComment = get(match, 'params.commentId', null);
    let lastUser;
    let lastDate = new Date(0);

    let loading;
    if (!children.length) {
      loading = (
        <div>
          <Loading />
        </div>
      );
    }

    function renderComment(comment) {
      if (!comment) return null;
      let hideAvatar = true;
      const commentDate = new Date(comment.createdAt);
      if (
        comment.user !== lastUser ||
        lastDate.getTime() + 120000 < commentDate.getTime()
      ) {
        hideAvatar = false;
        lastUser = comment.user;
        lastDate = commentDate;
      }
      return (
        <View key={comment._id} p={'0 2 1 2'}>
          <ChatMessage
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
            hidePostButtons
            hideReplyButtons
            hideAvatar={hideAvatar}
            condensedView
          />
        </View>
      );
    }

    return (
      <div
        style={{
          height: 'calc(100vh - 70px)',
          position: 'relative',
          overflow: 'scroll'
        }}
        ref={el => (this.el = el)}
      >
        <div p={'0 0 2 0'}>
          <Spacer style={{ height: 55 }} />
          {loading}
          {children.map(renderComment.bind(this))}
          {pending.map(renderComment.bind(this))}
        </div>
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
      screenSize: state.navigation.screenSize,
      pendingComments: state.chat.pendingComments
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
  )(ChatLog)
);
