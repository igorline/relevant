import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, View, StyledTextareaAutocomplete, Form } from 'modules/styled/web';
import { alert, text } from 'app/utils';
import { colors, sizing } from 'app/styles';
import UAvatar from 'modules/user/UAvatar.component';
import styled from 'styled-components';
import { Spacer } from 'modules/styled/uni';
import { withRouter } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { searchUser } from 'modules/user/user.actions';
import Avatar from 'modules/user/avatarbox.component';

const UserSelect = styled(View)`
  cursor: pointer;
  &:hover {
    background: ${colors.lightGrey};
  }
`;

Item.propTypes = {
  entity: PropTypes.object
};

function Item({ entity: { user } }) {
  return (
    <UserSelect p={'1 2 1 1'}>
      <Avatar user={user} noLink />
    </UserSelect>
  );
}

const AvatarContainer = styled(View)`
  position: absolute;
  left: ${sizing(0)};
  top: ${sizing(0)};
  z-index: 10;
`;

CommentForm.propTypes = {
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
  autoFocus: PropTypes.bool,
  history: PropTypes.object,
  screenSize: PropTypes.number
};

function CommentForm({
  comment,
  edit,
  cancel,
  auth,
  isReply,
  className,
  nestingLevel,
  additionalNesting,
  autoFocus,
  screenSize,
  parentComment,
  parentPost,
  history,
  actions,
  text: buttonText,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const dispatch = useDispatch();

  const initalText = edit ? comment.body : '';
  const [commentText, setCommentText] = useState(initalText);
  // const search = useSelector(state => state.user.search);

  const textArea = useRef();
  if (edit && textArea.current) textArea.current.focus();

  const handleChange = e => setCommentText(e.target.value);

  // TODO - non-shift enter?
  // handleKeydown(e) {
  //  if (e.keyCode == 13 && e.shiftKey == false) {
  //  }
  // }

  async function createComment() {
    if (!auth.isAuthenticated) {
      return alert.browserAlerts.alert('Please log in to post comments');
    }
    if (!commentText || !commentText.length) {
      return alert.browserAlerts.alert('no comment');
    }

    const { mentions, tags } = getMentionsAndTags();

    const commentObj = {
      parentPost: parentPost._id,
      parentComment: isReply && parentComment ? parentComment._id : null,
      linkParent: parentPost.type === 'link' ? parentPost._id : null,
      text: commentText.trim(),
      tags,
      mentions,
      user: auth.user._id,
      metaPost: parentPost.metaPost
    };
    setCommentText('');

    return actions.createComment(commentObj).then(newComment => {
      if (!newComment) {
        setCommentText('newComment');
        if (textArea.current) textArea.current.focus();
      } else {
        history.push(
          `/${newComment.community}/post/${newComment.parentPost}/${newComment._id}`
        );
      }
    });
  }

  async function updateComment() {
    if (comment.body === commentText) {
      return cancel();
    }
    const { mentions } = getMentionsAndTags();
    const originalText = comment.body;
    comment.body = commentText;
    comment.mentions = mentions;

    return actions.updateComment(comment).then(results => {
      if (results) {
        cancel();
      } else {
        comment.body = originalText;
        alert.browserAlerts.alert('Error updating comment');
      }
    });
  }

  function getMentionsAndTags() {
    const words = text.getWords(commentText);
    const tags = text.getTags(words);
    const mentions = text.getMentions(words);
    return { mentions, tags };
  }

  const handleSubmit = e => {
    e.preventDefault();
    if (edit) return updateComment();
    return createComment();
  };

  if (!auth.isAuthenticated) return null;
  let backgroundColor = 'transparent';
  let paddingTop = 0;
  if (isReply && focused) {
    paddingTop = 4;
    backgroundColor = colors.secondaryBG;
  }

  return (
    <Spacer
      fdirection="row"
      grow={1}
      {...rest}
      pt={paddingTop}
      bg={backgroundColor}
      nestingLevel={screenSize ? 0 : nestingLevel}
      additionalNesting={screenSize ? 0 : additionalNesting}
      screenSize={screenSize}
    >
      <View fdirection="column" flex={1} style={{ position: 'relative' }}>
        {focused ? null : (
          <AvatarContainer p={2}>
            <UAvatar user={auth.user} size={3} />
          </AvatarContainer>
        )}
        <Form
          onSubmit={handleSubmit}
          fdirection="row"
          justify-="space-between"
          align="flex-start"
          m="0 0 2.5 0"
          flex={1}
        >
          <StyledTextareaAutocomplete
            containerStyle={{
              display: 'block',
              width: '100%'
            }}
            listStyle={{
              display: 'flex',
              flexWrap: 'wrap',
              listStyleType: 'none',
              padding: 0
            }}
            style={{ width: '100%' }}
            innerRef={c => (textArea.current = c)}
            rows={2}
            placeholder="Enter comment..."
            value={commentText}
            // onKeyDown={handleKeydown}
            onChange={handleChange}
            m={0}
            flex={1}
            autoFocus={autoFocus}
            pl={focused ? 2 : 6}
            onFocus={() => setFocused(true)}
            // bug with autocomplete
            // https://github.com/webscopeio/react-textarea-autocomplete/issues/178
            onBlur={e => e.type === 'blur' && setFocused(false)}
            textAreaComponent={{ component: TextareaAutosize, ref: 'inputRef' }}
            loadingComponent={() => <span>Loading</span>}
            trigger={{
              '@': {
                dataProvider: async token => {
                  const users = await dispatch(searchUser(token));
                  return users.map(u => ({
                    user: u,
                    name: u.handle
                  }));
                },
                component: Item,
                output: item => '@' + item.name
              }
            }}
          />
        </Form>
        {focused || commentText ? (
          <View justify="flex-end" fdirection="row">
            <Button
              onMouseDown={cancel}
              onTouchStart={cancel}
              bg="transparent"
              c={colors.secondaryText}
              disabled={!auth.isAuthenticated}
              p={[null, '0 4']}
              minwidth={1}
            >
              Cancel
            </Button>
            <Button
              onMouseDown={handleSubmit}
              onTouchStart={handleSubmit}
              disabled={!auth.isAuthenticated}
              p={[null, '0 4']}
              minwidth={1}
            >
              {buttonText}
            </Button>
          </View>
        ) : null}
      </View>
    </Spacer>
  );
}

export default withRouter(CommentForm);
