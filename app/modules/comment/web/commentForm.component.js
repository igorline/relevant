import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, View, StyledTextarea, Form } from 'modules/styled/web';
import { alert, text } from 'app/utils';
import { colors, sizing } from 'app/styles';
import UAvatar from 'modules/user/UAvatar.component';
import styled from 'styled-components/primitives';
import { Spacer } from 'modules/styled/uni';

const AvatarContainer = styled.View`
  position: absolute;
  left: ${sizing(1.5)};
  top: ${sizing(1.5)};
  z-index: 10;
`;

class CommentForm extends Component {
  static propTypes = {
    edit: PropTypes.bool,
    comment: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object,
    cancel: PropTypes.func,
    updatePosition: PropTypes.func,
    text: PropTypes.string,
    isReply: PropTypes.bool,
    parentPost: PropTypes.object,
    parentComment: PropTypes.object,
    className: PropTypes.string,
    nestingLevel: PropTypes.number,
    additionalNesting: PropTypes.number,
    autoFocus: PropTypes.bool
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
      comment: '',
      focused: false
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

    return this.props.actions.createComment(commentObj).then(success => {
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
    const {
      cancel,
      auth,
      edit,
      isReply,
      // nestingLevel,
      className,
      nestingLevel,
      additionalNesting,
      autoFocus,
      ...rest
    } = this.props;
    if (!auth.isAuthenticated) return null;
    let backgroundColor = 'transparent';
    let paddingTop = 0;
    if (isReply && this.state.focused) {
      paddingTop = 4;
      backgroundColor = colors.secondaryBG;
    }
    return (
      <Spacer
        fdirection="row"
        grow={1}
        {...rest}
        bg={backgroundColor}
        pt={paddingTop}
        nestingLevel={(nestingLevel || 0) + (additionalNesting || 0)}
      >
        <View fdirection="column" flex={1} style={{ position: 'relative' }}>
          {this.state.focused ? null : (
            <AvatarContainer>
              <UAvatar user={auth.user} size={3} />
            </AvatarContainer>
          )}
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
              pl={this.state.focused ? 2 : 6}
              onFocus={() => this.setState({ focused: true })}
              onBlur={() => setTimeout(() => this.setState({ focused: false }), 100)}
            />
          </Form>
          {this.state.focused || this.state.comment ? (
            <View justify="flex-end" fdirection="row">
              <Button
                onClick={cancel}
                bg="transparent"
                c={colors.secondaryText}
                disabled={!auth.isAuthenticated}
              >
                Cancel
              </Button>
              <Button onClick={this.handleSubmit} disabled={!auth.isAuthenticated}>
                {this.props.text}
              </Button>
            </View>
          ) : null}
        </View>
      </Spacer>
    );
  }
}

export default CommentForm;
