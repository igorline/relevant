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
    auth: PropTypes.object,
    actions: PropTypes.object,
    updatePosition: PropTypes.func,
    isReply: PropTypes.bool,
    parentPost: PropTypes.object,
    parentComment: PropTypes.object,
    autoFocus: PropTypes.bool
    // history: PropTypes.object,
  };

  state = {
    inputHeight: 50,
    comment: '',
    focused: false
  };

  handleChange = e => {
    this.setState({ comment: e.target.value });
  };

  handleKeydown = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      this.handleSubmit(e);
    }
  };

  setMention = user => {
    const comment = this.state.comment.replace(this.mention, '@' + user._id);
    this.setState({ comment });
  };

  createComment = async () => {
    const { isReply, parentComment, parentPost, auth, actions } = this.props;
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
      metaPost: parentPost.metaPost,
      type: 'chat'
    };
    this.setState({ comment: '', inputHeight: 50 });

    // so we can display this comment immediately :-/
    const pendingComment = {
      ...commentObj,
      _id: Math.random(),
      body: commentObj.text,
      createdAt: new Date().toString(),
      embeddedUser: auth.user,
      pending: true
    };
    actions.addPendingComment(pendingComment, parentPost);
    return actions.createComment(commentObj).then(() => {
      actions.removePendingComment(pendingComment, parentPost);
      if (this.textInput) this.textInput.focus();
    });
  };

  processInput = comment => {
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
  };

  handleSubmit = e => {
    e.preventDefault();
    return this.createComment();
  };

  render() {
    const { auth, autoFocus } = this.props;
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
          justify="space-between"
          align="flex-start"
          m="0 0 2.5 0"
          flex={1}
        >
          <StyledTextarea
            inputRef={c => (this.textArea = c)}
            rows={2}
            placeholder="Write a message"
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
