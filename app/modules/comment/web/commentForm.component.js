import React, { useState, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, View } from 'modules/styled/web';
import { alert, text } from 'app/utils';
import { colors, sizing } from 'app/styles';
import UAvatar from 'modules/user/UAvatar.component';
import styled from 'styled-components';
import { Spacer } from 'modules/styled/uni';
import { createComment, updateComment } from 'modules/comment/comment.actions';
import history from 'modules/navigation/history';
import TextAreaWithMention from 'modules/text/web/textAreaWithMention';
import { useCommunityAuth } from 'modules/createPost/hooks';

const AvatarContainer = styled(View)`
  position: absolute;
  left: ${sizing(0)};
  top: ${sizing(0)};
  z-index: 10;
`;

CommentFormComponent.propTypes = {
  edit: PropTypes.bool,
  comment: PropTypes.object,
  cancel: PropTypes.func,
  buttonText: PropTypes.string,
  parentPost: PropTypes.object,
  parentComment: PropTypes.object,
  nestingLevel: PropTypes.number,
  additionalNesting: PropTypes.number,
  autoFocus: PropTypes.bool,
  screenSize: PropTypes.number
};

export function CommentFormComponent({
  comment,
  edit,
  cancel,
  nestingLevel,
  additionalNesting,
  autoFocus,
  parentComment,
  parentPost,
  buttonText,
  ...styleProps
}) {
  const auth = useSelector(state => state.auth);
  const screenSize = useSelector(state => state.navigation.screenSize);

  const [focused, setFocused] = useState(false);
  const dispatch = useDispatch();

  const initalText = edit ? comment.body : '';
  const [commentText, setCommentText] = useState(initalText);

  const textArea = useRef();

  const handleChange = e => setCommentText(e.target.value);

  const authError = useCommunityAuth();

  // TODO - non-shift enter?
  // handleKeydown(e) {
  //  if (e.keyCode == 13 && e.shiftKey == false) {
  //  }
  // }

  async function _createComment() {
    if (!auth.isAuthenticated) {
      return alert.browserAlerts.alert('Please log in to post comments');
    }
    if (!commentText || !commentText.length) {
      return alert.browserAlerts.alert('no comment');
    }

    const { mentions, tags } = getMentionsAndTags();

    const commentObj = {
      parentPost: parentPost._id,
      parentComment: parentComment ? parentComment._id : null,
      linkParent: parentPost.type === 'link' ? parentPost._id : null,
      text: commentText.trim(),
      tags,
      mentions,
      metaPost: parentPost.metaPost
    };

    setCommentText('');
    const newComment = await dispatch(createComment(commentObj));
    if (!newComment) {
      setCommentText(commentText);
      if (textArea.current) textArea.current.focus();
      return null;
    }
    _cancel();
    return history.push(
      `/${newComment.community}/post/${newComment.parentPost}/${newComment._id}`
    );
  }

  async function _updateComment() {
    if (comment.body === commentText) {
      return _cancel();
    }
    const { mentions } = getMentionsAndTags();
    const originalText = comment.body;
    comment.body = commentText;
    comment.mentions = mentions;

    const newComment = await dispatch(updateComment(comment));
    if (newComment) return _cancel();

    comment.body = originalText;
    alert.browserAlerts.alert('Error updating comment');
    return null;
  }

  function getMentionsAndTags() {
    const words = text.getWords(commentText);
    const tags = text.getTags(words);
    const mentions = text.getMentions(words);
    return { mentions, tags };
  }

  function _cancel() {
    setCommentText('');
    cancel && cancel();
  }

  const handleSubmit = () => {
    // e.preventDefault();
    if (edit) return _updateComment();
    return _createComment();
  };

  if (!auth.isAuthenticated) return null;

  const backgroundColor = !edit && focused ? colors.secondaryBG : 'transparent';
  const paddingTop = !edit && focused ? 4 : 0;

  return (
    <Spacer
      fdirection="row"
      grow={1}
      {...styleProps}
      pt={paddingTop}
      bg={backgroundColor}
      nestingLevel={screenSize ? 0 : nestingLevel}
      additionalNesting={screenSize ? 0 : additionalNesting}
      screenSize={screenSize}
    >
      {authError && focused ? (
        authError.component
      ) : (
        <View fdirection="column" flex={1} style={{ position: 'relative' }}>
          <TextAreaWithMention
            textArea={textArea}
            value={commentText}
            autoFocus={autoFocus}
            leftPadding={focused ? 2 : 6}
            onChange={handleChange}
            setFocused={setFocused}
            // withPreview
            placeholder={'Enter comment...'}
            minheight={focused ? sizing(8) : null}
          >
            {focused ? null : (
              <AvatarContainer p={2}>
                <UAvatar user={auth.user} size={3} noLink />
              </AvatarContainer>
            )}
          </TextAreaWithMention>
          {focused || commentText ? (
            <View justify="flex-end" fdirection="row">
              <Button
                onMouseDown={_cancel}
                onTouchStart={_cancel}
                bg="transparent"
                c={colors.secondaryText}
                disabled={!auth.isAuthenticated}
                p={[null, '0 4']}
                minwidth={1}
                mr={1}
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
      )}
    </Spacer>
  );
}

export default memo(CommentFormComponent);
