import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import { alert, text } from 'app/utils';

class CommentForm extends Component {
  static propTypes = {
    edit: PropTypes.bool,
    comment: PropTypes.object,
    auth: PropTypes.object,
    post: PropTypes.object,
    actions: PropTypes.object,
    cancel: PropTypes.func,
    updatePosition: PropTypes.func,
    text: PropTypes.string,
    isReply: PropTypes.bool,
    parentPost: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleKeydown = this.handleKeydown.bind(this);
    this.state = {
      inputHeight: 50,
      comment: ''
    };
  }

  componentDidMount() {
    if (this.props.edit && this.props.comment) {
      this.setState({ comment: this.props.comment.body });
      this.textArea.focus();
    }
  }

  handleChange(e) {
    this.setState({ comment: e.target.value });
  }

  // TODO do we need his?
  // handleKeydown(e) {
  //  if (e.keyCode == 13 && e.shiftKey == false) {
  //  }
  // }

  setMention(user) {
    const comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
  }

  async createComment() {
    if (!this.props.auth.isAuthenticated) {
      return alert.browserAlerts.alert('Please log in to post comments');
    }
    if (!this.state.comment || !this.state.comment.length) {
      return alert.browserAlerts.alert('no comment');
    }

    const comment = this.state.comment.trim();
    const commentObj = {
      parentPost: this.props.parentPost,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: this.props.auth.user._id
    };
    if (this.props.isReply) {
      commentObj.parentComment = this.props.post.id;
    }

    this.setState({ comment: '', inputHeight: 50 });

    return this.props.actions
    .createComment(commentObj)
    .then(success => {
      if (!success) {
        this.setState({ comment, inputHeight: 50 });
        this.textInput.focus();
      }
    });
  }

  async updateComment() {
    const { comment } = this.props;
    const body = this.state.comment;
    if (comment.body === body) {
      return this.props.cancel();
    }
    const words = text.getWords(body);
    const mentions = text.getMentions(words);
    const originalText = comment.body;
    comment.body = body;
    comment.mentions = mentions;

    return this.props.actions.updateComment(comment).then(results => {
      if (results) {
        this.props.cancel();
      } else {
        comment.body = originalText;
        alert.browserAlerts.alert('Error updating comment');
      }
    });
  }

  processInput(comment) {
    const words = text.getWords(comment);

    const lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    } // else this.props.actions.setUserSearch([]);

    this.commentTags = text.getTags(words);
    this.commentMentions = text.getMentions(words);
    this.props.updatePosition({
      inputHeight: this.state.inputHeight,
      top: this.top
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.props.edit) return this.updateComment();
    return this.createComment();
  }

  render() {
    if (!this.props.auth.isAuthenticated) return null;
    return (
      <div className="comments formContainer">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <form onSubmit={this.handleSubmit}>
            <Textarea
              inputRef={c => (this.textArea = c)}
              style={{ minHeight: '60px' }}
              rows={2}
              placeholder="Enter comment..."
              value={this.state.comment}
              onKeyDown={this.handleKeydown}
              onChange={this.handleChange}
            />
          </form>
          <div style={{ alignSelf: 'flex-end' }}>
            {this.props.cancel && (
              <button
                onClick={this.props.cancel}
                className={'shadowButton'}
                disabled={!this.props.auth.isAuthenticated}
              >
                Cancel
              </button>
            )}
            <button
              onClick={this.handleSubmit}
              className={'shadowButton'}
              disabled={!this.props.auth.isAuthenticated}
            >
              {this.props.text}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CommentForm;
