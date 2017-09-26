import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NewCommentForm from './newCommentForm.component';
import Comment from './comment.component';
import * as postActions from '../../../actions/post.actions';

class Comments extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.actions.getComments(this.props.params.id);
  }

  handleCommentSubmit(commentObj) {
    this.props.actions.createComment(this.auth.token, commentObj)
  }

  render() {
    let comments = this.props.comments.commentsById[this.props.params.id];
    if (!comments) return null;
    comments = comments.data;
    return (
      <div className='comments'>
        <NewCommentForm {...this.props} onCommentSubmit={this.handleCommentSubmit} />
        {(comments.length !== 0) ?
          <div>
            {comments.map(function (comment, i) {
              return (
                <div key={i}>
                  <Comment data={comment} />
                </div>
              );
            })}
          </div>
        :
          <div className='empty'>
            <br />
            No comments
          </div>
        }
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
