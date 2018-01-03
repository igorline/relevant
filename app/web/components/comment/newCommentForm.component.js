import React, { Component, PropTypes } from 'react'
import Textarea from 'react-textarea-autosize';
import Comments from '../comment/comment.container'
import Avatar from '../common/avatar.component'
import * as utils from '../../../utils';

class NewCommentForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      inputHeight: 50,
      comment: '',
    };
  }

  handleChange(e) {
    // console.log('change', e.target.value)
    this.setState({comment: e.target.value});
  }

  handleKeydown(e) {
    // console.log('keydown', e.target.value)
    if (e.keyCode == 13 && e.shiftKey == false) {
      this.handleSubmit(e);
    }
  }

  componentWillUnmount() {
    // this.props.actions.setUserSearch([]);
  }

  setMention(user) {
    let comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
    // this.props.actions.setUserSearch([]);
  }

  async createComment() {
    if (!this.state.comment || !this.state.comment.length) {
      return alert('no comment');
    }

    let comment = this.state.comment.trim();
    console.log(this.props)
    let commentObj = {
      post: this.props.post._id,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: this.props.auth.user._id
    };

    this.setState({ comment: '', inputHeight: 50 });
    // this.textInput.blur();
    // this.props.onFocus('new');
    // this.props.actions.setUserSearch([]);

    this.props.actions.createComment(await utils.token.get(), commentObj)
    .then(success => {
      if (!success) {
        this.setState({ comment, inputHeight: 50 });
        this.textInput.focus();
        return;
      }
      this.props.scrollToBottom();
    });

    // this.props.onCommentSubmit(commentObj);
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
    console.log('submit', this.state.comment)
    e.preventDefault();
    this.createComment()
  }

  render() {
    if (! this.props.auth.isAuthenticated) return null
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Avatar auth={this.props.auth} user={this.props.auth.user} />
          <Textarea
            placeholder="Enter comment..."
            value={this.state.comment}
            onKeyDown={this.handleKeydown}
            onChange={this.handleChange}
          />
          <input type="submit" value="Submit" />
          {/*this.props.comment.failureMsg && <div>{ this.props.comment.failureMsg }</div>*/}
        </form>
      </div>
    )
  }
}

export default NewCommentForm
