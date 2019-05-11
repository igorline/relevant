import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyledTextarea, Form } from 'modules/styled/web';
import { alert, text } from 'app/utils';
import { sizing } from 'app/styles';
import UAvatar from 'modules/user/UAvatar.component';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

const AvatarContainer = styled(View)`
  position: absolute;
  left: ${sizing(0)};
  top: ${sizing(0)};
  z-index: 10;
`;

class ChatForm extends Component {
  static propTypes = {
    edit: PropTypes.bool,
    comment: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object,
    cancel: PropTypes.func,
    updatePosition: PropTypes.func,
    isReply: PropTypes.bool,
    parentPost: PropTypes.object,
    parentComment: PropTypes.object,
    autoFocus: PropTypes.bool
    // history: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.setMention = this.setMention.bind(this);
    this.createComment = this.createComment.bind(this);
    this.processInput = this.processInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.state = {
      inputHeight: 50,
      comment: '',
      focused: false
    };
  }

  componentDidMount() {
    if (this.props.edit && this.props.comment) {
      this.setState({ comment: this.props.comment.body });
      if (this.textArea) this.textArea.focus();
    }
  }

  handleChange(e) {
    this.setState({ comment: e.target.value });
  }

  handleKeydown(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      this.handleSubmit(e);
    }
  }

  setMention(user) {
    const comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
  }

  async createComment() {
    const { isReply, parentComment, parentPost, auth } = this.props;
    if (!this.props.auth.isAuthenticated) {
      return alert.browserAlerts.alert('Please log in to post comments');
    }
    if (!this.state.comment || !this.state.comment.length) {
      return alert.browserAlerts.alert('no comment');
    }

    const comment = this.state.comment.trim();
    const commentObj = {
      parentPost: parentPost._id,
      parentComment: isReply && parentComment ? parentComment._id : null,
      linkParent: parentPost.type === 'link' ? parentPost._id : null,
      text: comment,
      tags: this.commentTags,
      mentions: this.commentMentions,
      user: auth.user._id,
      metaPost: parentPost.metaPost
    };
    this.setState({ comment: '', inputHeight: 50 });

    return this.props.actions.createComment(commentObj).then(newComment => {
      if (!newComment) {
        this.setState({ newComment, inputHeight: 50 });
        if (this.textInput) this.textInput.focus();
      } else {
        // history.push(
        //   `/${newComment.community}/channel/${newComment.parentPost}/${newComment._id}`
        // );
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
    const {
      auth,
      // nestingLevel,
      autoFocus
    } = this.props;
    if (!auth.isAuthenticated) return null;
    return (
      <View
        fdirection="column"
        flex={1}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%'
        }}
      >
        <AvatarContainer p={2}>
          <UAvatar user={auth.user} size={3} />
        </AvatarContainer>
        <Form
          onSubmit={this.handleSubmit}
          fdirection="row"
          justify-="space-between"
          align="flex-start"
          m="0 0 2.5 0"
          flex={1}
        >
          <StyledTextarea
            inputRef={c => (this.textArea = c)}
            rows={2}
            placeholder="Enter comment..."
            value={this.state.comment}
            onKeyDown={this.handleKeydown}
            onChange={this.handleChange}
            m={0}
            flex={1}
            autoFocus={autoFocus}
            pl={6}
            onFocus={() => this.setState({ focused: true })}
            onBlur={() => setTimeout(() => this.setState({ focused: false }), 100)}
            style={{
              minHeight: sizing(7),
              '&: focus': {
                minHeight: sizing(7)
              }
            }}
          />
        </Form>
      </View>
    );
  }
}

export default withRouter(ChatForm);
