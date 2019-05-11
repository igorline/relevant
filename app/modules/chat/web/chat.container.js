import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as postActions from 'modules/post/post.actions';
import * as chatActions from 'modules/chat/chat.actions';
import * as commentActions from 'modules/comment/comment.actions';
import * as investActions from 'modules/post/invest.actions';
// import Comments from 'modules/comment/web/comment.container';
// import get from 'lodash.get';
import ChatForm from './chatForm.component';
import ChatLog from './chatLog.component';

class ChatContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    posts: PropTypes.object,
    match: PropTypes.object,
    // location: PropTypes.object,
    // comments: PropTypes.object,
    auth: PropTypes.object
  };

  static fetchData(dispatch, params) {
    if (!params.id || params.id === undefined) return null;
    return dispatch(postActions.getSelectedPost(params.id));
  }

  componentDidMount() {
    this.getPost();
  }

  getPost = () => {
    const { params } = this.props.match;
    const post = this.props.posts.posts[params.id];
    if (!post) {
      this.props.actions.getSelectedPost(params.id);
    }
  };

  componentDidUpdate(prevProps) {
    // TODO this is not needed if we don't wipe post reducer
    // when switching communities
    if (prevProps.auth.community !== this.props.auth.community) this.getPost();
  }

  render() {
    const { params } = this.props.match;
    const { posts, actions } = this.props;
    const post = posts.posts[params.id];
    if (!post) return null;
    const hasPost = post && post !== 'notFound';

    return (
      <div
        style={{
          height: '100vh',
          maxHeight: '100vh',
          position: 'relative'
        }}
      >
        {hasPost ? (
          <ChatLog post={post} actions={actions} {...this.props} />
        ) : (
          <div>{'This is the beginning of the conversation'}</div>
        )}
        <ChatForm post={post} parentPost={post} autoFocus {...this.props} />
      </div>
    );
  }
}

export default connect(
  state => ({
    comments: state.comments,
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    investments: state.investments,
    myPostInv: state.investments.myPostInv,
    isAuthenticated: state.auth.isAuthenticated
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...chatActions,
        ...commentActions,
        ...postActions,
        ...investActions
      },
      dispatch
    )
  })
)(ChatContainer);
