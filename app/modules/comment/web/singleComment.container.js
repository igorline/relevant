import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as commentActions from 'modules/comment/comment.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as animationActions from 'modules/animation/animation.actions';
import Comment from 'modules/comment/web/comment.component';

class SingleComment extends Component {
  static propTypes = {
    actions: PropTypes.object,
    user: PropTypes.object,
    comment: PropTypes.object,
    hidePostButtons: PropTypes.bool,
    screenSize: PropTypes.number,
    nestingLevel: PropTypes.number,
    parentPost: PropTypes.object,
    preview: PropTypes.bool,
    hideAvatar: PropTypes.bool,
    hideBorder: PropTypes.bool,
    noLink: PropTypes.bool,
    avatarText: PropTypes.func,
    inMainFeed: PropTypes.bool,
    additionalNesting: PropTypes.number
  };

  state = {
    activeComment: null
  };

  componentDidMount() {
    // TODO: Fetch comment here?
    // const { params } = this.props.match;
    // this.props.actions.getSingleComment(params.id);
  }

  setActiveComment = commentId => {
    const activeComment = this.state.activeComment === commentId ? null : commentId;
    this.setState({ activeComment });
  };

  render() {
    const {
      comment,
      nestingLevel,
      screenSize,
      parentPost,
      preview,
      hidePostButtons,
      inMainFeed,
      avatarText,
      noLink,
      hideBorder,
      user,
      hideAvatar,
      actions,
      additionalNesting
    } = this.props;
    if (!comment) return null;

    return (
      <Comment
        activeComment={this.state.activeComment}
        setActiveComment={this.setActiveComment}
        nestingLevel={nestingLevel || 0}
        screenSize={screenSize}
        inMainFeed={inMainFeed}
        avatarText={avatarText}
        noLink={noLink}
        hideBorder={hideBorder}
        hideAvatar={hideAvatar}
        preview={preview}
        parentPost={parentPost}
        hidePostButtons={hidePostButtons}
        comment={comment}
        user={user}
        auth={actions}
        actions={actions}
        additionalNesting={additionalNesting}
      />
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
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
)(SingleComment);
