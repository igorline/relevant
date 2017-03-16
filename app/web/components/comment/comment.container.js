import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import NewCommentForm from './newCommentForm';
import Comment from './comment';
import * as CommentActions from '../../actions/comment'

class Comments extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.getComments(this.props.post.selectedPost._id);
  }

  handleCommentSubmit(text) {
    this.createComment(this.auth.token, this.auth.user, text, this.post.selectedPost._id);
  }

  render () {
    var self = this;
    var comments = this.props.comment.comments.data;
    if (!comments) return null;

    return (
      <div>
        <h2>Comments</h2>
        <NewCommentForm {...self.props} onCommentSubmit={this.handleCommentSubmit} />
        {(comments.length !== 0) ?
          <div>
            {comments.map(function(comment){
              return (
                <div>
                <Comment data={comment} />
                </div>
              );
            })}
          </div>
        :
          <div>
            <br />
            No comments
          </div>
        }
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      comment: state.comment
    }
  },
  dispatch => {
    return Object.assign({}, { dispatch },  bindActionCreators(CommentActions, dispatch))
})(Comments)
