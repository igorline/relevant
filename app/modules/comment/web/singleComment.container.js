import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as commentActions from 'modules/comment/comment.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as animationActions from 'modules/animation/animation.actions';
import { View } from 'modules/styled/uni';
import Comment from 'modules/comment/web/comment.component';

class SingleComment extends Component {
  static propTypes = {
    actions: PropTypes.object,
    match: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    myPostInv: PropTypes.object,
    user: PropTypes.object,
    comment: PropTypes.object,
    parentPostId: PropTypes.string,
    hidePostButtons: PropTypes.bool,
    hideBorderBottom: PropTypes.bool,
    postUrl: PropTypes.string
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
    const { comment, nestingLevel } = this.props;
    if (!comment) return null;
    return (
      <View>
        <Comment
          {...this.props}
          activeComment={this.state.activeComment}
          setActiveComment={this.setActiveComment}
          nestingLevel={nestingLevel || 0}
        />
      </View>
    );
  }
}

SingleComment.propTypes = {
  nestingLevel: PropTypes.number,
  comment: PropTypes.object
};

export default connect(
  state => ({
    auth: state.auth,
    myPostInv: state.investments.myPostInv,
    user: state.user
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
