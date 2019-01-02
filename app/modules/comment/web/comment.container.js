import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import CommentForm from './commentForm.component';
import Comment from './comment.component';

class Comments extends Component {
  static propTypes = {
    actions: PropTypes.object,
    match: PropTypes.object,
    comments: PropTypes.object,
    posts: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    myPostInv: PropTypes.object,
    user: PropTypes.object
  };

  componentDidMount() {
    const { params } = this.props.match;
    this.props.actions.getComments(params.id);
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  render() {
    const { params } = this.props.match;
    let comments = this.props.comments.commentsById[params.id];
    if (!comments) return null;
    comments = comments.data;
    if (!comments) return null;
    return (
      <div className="comments">
        {comments.length !== 0 ? (
          <div>
            {comments.map(id => {
              const comment = this.props.posts.posts[id];
              if (!comment) return null;
              return (
                <Comment
                  key={id}
                  auth={this.props.auth}
                  comment={comment}
                  actions={this.props.actions}
                  location={this.props.location}
                  myPostInv={this.props.myPostInv}
                  user={this.props.user}
                />
              );
            })}
          </div>
        ) : null}
        <div className={'formContainer'}>
          <CommentForm text={'Reply'} {...this.props} />
        </div>
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
        ...postActions,
        ...createPostActions,
        ...investActions
      },
      dispatch
    )
  })
)(Comments);
