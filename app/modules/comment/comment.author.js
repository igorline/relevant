import React, { memo } from 'react';
import { View, Box } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import CommentInfo from 'modules/comment/comment.info';

CommentAuthor.propTypes = {
  comment: PropTypes.object,
  hideAvatar: PropTypes.bool,
  avatarText: PropTypes.func,
  noLink: PropTypes.bool,
  user: PropTypes.object,
  popup: PropTypes.node,
  preview: PropTypes.bool
};

export default memo(CommentAuthor);

function CommentAuthor({
  comment,
  hideAvatar,
  user,
  avatarText,
  noLink,
  popup,
  preview
}) {
  if (hideAvatar && popup)
    return <Box style={{ position: 'absolute', right: 0, zIndex: 10 }}>{popup}</Box>;

  const originalPost = !comment.parentPost;

  const userEl = originalPost ? (
    !preview && <CommentInfo hidePostButtons={true} comment={comment} user={user} />
  ) : (
    <AvatarBox
      twitter={comment.twitter}
      user={{ ...user, _id: comment.user }}
      postTime={comment.createdAt}
      showRelevance
      avatarText={avatarText}
      noLink={noLink}
    />
  );

  if (!userEl && !popup) return null;

  return (
    <View fdirection={'row'} justify={'space-between'} zIndex={2}>
      {userEl}
      {popup}
    </View>
  );
}
