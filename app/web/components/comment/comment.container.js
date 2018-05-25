import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NewCommentForm from './newCommentForm.component';
import Comment from './comment.component';
import Divider from '../common/divider.component'
import * as postActions from '../../../actions/post.actions';

class Comments extends Component {
  componentDidMount() {
    this.props.actions.getComments(this.props.params.id);
  }

  handleCommentSubmit(commentObj) {
    this.props.actions.createComment(this.auth.token, commentObj);
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  render() {
    let comments = this.props.comments.commentsById[this.props.params.id];
    if (!comments) return null;
    comments = comments.data;
    return (
      <div className='comments'>
        {(comments.length !== 0) ?
          <div>{comments.map((comment, i) => {
            return (
              <Comment key={comment._id} auth={this.props.auth} data={comment} />
            );
          })}
          </div>
          : null
/*
          <div className='empty'>
            <Divider>No comments</Divider>
          </div>
          */
        }
        <NewCommentForm
          {...this.props}
          onCommentSubmit={this.handleCommentSubmit}
          scrollToBottom={this.scrollToBottom.bind(this)}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    comments: state.comments
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...postActions
    }, dispatch)
  })
)(Comments);
