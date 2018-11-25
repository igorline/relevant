import React, { Component, PropTypes } from 'react'
import Textarea from 'react-textarea-autosize';
import Comments from '../comment/comment.container'
import Avatar from '../common/avatar.component'
import * as utils from '../../../utils';

class CommentForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      inputHeight: 50,
      comment: '',
    };
  }

  componentDidMount() {
    if (this.props.edit && this.props.comment) {
      this.setState({ comment: this.props.comment.body });
      console.log(this.textArea);
      this.textArea.focus();
    }
  }

  handleChange(e) {
    this.setState({ comment: e.target.value });
  }

  handleKeydown(e) {
    // if (e.keyCode == 13 && e.shiftKey == false) {
    // }
  }

  setMention(user) {
    let comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
  }

  async createComment() {
    if (!this.props.auth.isAuthenticated) {
      return alert('Please log in to post comments');
    }
    if (!this.state.comment || !this.state.comment.length) {
      return alert('no comment');
    }

    let comment = this.state.comment.trim();
    let commentObj = {
      post: this.props.post.id,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: this.props.auth.user._id
    };

    this.setState({ comment: '', inputHeight: 50 });

    this.props.actions.createComment(await utils.token.get(), commentObj)
    .then(success => {
      if (!success) {
        this.setState({ comment, inputHeight: 50 });
        this.textInput.focus();
      }
    });
  }

  async updateComment() {
    let comment = this.props.comment;
    let body = this.state.comment;
    if (comment.body === body) {
      return this.props.cancel();
    }
    let words = utils.text.getWords(body);
    let mentions = utils.text.getMentions(words);
    let originalText = comment.body;
    comment.body = body;
    comment.mentions = mentions;

    this.props.actions.updateComment(comment)
    .then((results) => {
      if (results) {
        this.props.cancel();
      } else {
        comment.body = originalText;
        window.alert('Error updating comment');
      }
    });
  }

  processInput(comment) {
    let words = utils.text.getWords(comment);

    let lastWord = words[words.length - 1];
    if (lastWord.match(/@\S+/g) && lastWord.length > 1) {
      this.mention = lastWord;
      this.props.actions.searchUser(lastWord.replace('@', ''));
    }// else this.props.actions.setUserSearch([]);

    this.commentTags = utils.text.getTags(words);
    this.commentMentions = utils.text.getMentions(words);
    this.props.updatePosition({
      inputHeight: this.state.inputHeight, top: this.top
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.props.edit) return this.updateComment();
    return this.createComment();
  }

  render() {
    if (! this.props.auth.isAuthenticated) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <form onSubmit={this.handleSubmit}>
          <Textarea
            inputRef={c => this.textArea = c}
            style={{ minHeight: '60px' }}
            rows={2}
            placeholder="Enter comment..."
            value={this.state.comment}
            onKeyDown={this.handleKeydown}
            onChange={this.handleChange}
          />
        </form>
        <div style={{ alignSelf: 'flex-end' }}>
        {this.props.cancel && <button
          onClick={this.props.cancel}
          className={'shadowButton'}
          disabled={!this.props.auth.isAuthenticated}
        >
          Cancel
        </button>
        }
        <button
          onClick={this.handleSubmit}
          className={'shadowButton'}
          disabled={!this.props.auth.isAuthenticated}
        >
          { this.props.text }
        </button>
        </div>
      </div>
    );
  }
}

export default CommentForm;
