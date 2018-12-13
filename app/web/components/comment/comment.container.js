import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from 'react-router-redux';
import CommentForm from './commentForm.component';
import Comment from './comment.component';
import * as postActions from '../../../actions/post.actions';
import * as investActions from '../../../actions/invest.actions';
import * as createPostActions from '../../../actions/createPost.actions';

class Comments extends Component {
  static propTypes = {
    actions: PropTypes.object,
    params: PropTypes.object,
    comments: PropTypes.object,
    posts: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    myPostInv: PropTypes.object,
    user: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getComments(this.props.params.id);
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  render() {
    let comments = this.props.comments.commentsById[this.props.params.id];
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
        ...routerActions,
        ...createPostActions,
        ...investActions
      },
      dispatch
    )
  })
)(Comments);
