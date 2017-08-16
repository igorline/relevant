import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NewCommentForm from './newCommentForm';
import Comment from './comment';
import * as postActions from '../../../actions/post.actions';

class Comments extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.actions.getComments(this.props.post.selectedPost._id);
  }

  handleCommentSubmit(text) {
    this.createComment(this.auth.token, this.auth.user, text, this.post.selectedPost._id);
  }

  render() {
    let self = this;
    let comments = this.props.comments.commentsById[this.props.params.id];
    if (!comments) return null;

    return (
      <div>
        <h2>Comments</h2>
        <NewCommentForm {...self.props} onCommentSubmit={this.handleCommentSubmit} />
        {(comments.length !== 0) ?
          <div>
            {comments.map(function (comment) {
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
