import React, { useEffect, createRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Divider, Spacer, Image, Box } from 'modules/styled/uni';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/vote-buttons/postbuttons.container';
import CommentForm from 'modules/comment/web/commentForm.component';
import CommentBody from 'modules/comment/commentBody';
import { layout } from 'app/styles';
import ButtonRow from 'modules/post/web/buttonRow.component';
import { deleteComment } from 'modules/comment/comment.actions';
import CommentAuthor from 'modules/comment/comment.author';

Comment.propTypes = {
  comment: PropTypes.object,
  user: PropTypes.object,
  activeComment: PropTypes.string,
  setActiveComment: PropTypes.func,
  parentPost: PropTypes.object,
  childComments: PropTypes.object,
  posts: PropTypes.object,
  nestingLevel: PropTypes.number,
  hidePostButtons: PropTypes.bool,
  hideReplyButtons: PropTypes.bool,
  condensedView: PropTypes.bool,
  hideBorder: PropTypes.bool,
  post: PropTypes.object,
  hideAvatar: PropTypes.bool,
  noLink: PropTypes.bool,
  avatarText: PropTypes.func,
  focusedComment: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  scrollTo: PropTypes.func,
  preview: PropTypes.bool,
  inMainFeed: PropTypes.bool,
  additionalNesting: PropTypes.number
};

Comment.defaultProps = {
  additionalNesting: 0
};

function Comment(props) {
  const {
    comment,
    activeComment,
    childComments,
    posts,
    nestingLevel,
    hidePostButtons,
    hideReplyButtons,
    hideBorder,
    hideAvatar,
    noLink,
    avatarText,
    preview,
    inMainFeed,
    additionalNesting,
    parentPost,
    scrollTo,
    focusedComment,
    setActiveComment
  } = props;
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);

  const users = useSelector(state => state.user);
  const screenSize = useSelector(state => state.navigation.screenSize);
  const auth = useSelector(state => state.auth);

  const embeddedUser = get(comment, 'embeddedUser', {});
  const userId = users.handleToId[embeddedUser.handle];
  const user = users.users[userId] || embeddedUser;

  const el = createRef();

  useEffect(() => {
    const scrollIfFocused = () => {
      if (comment && focusedComment === comment._id) {
        el.current.measureInWindow((x, y) => {
          scrollTo && scrollTo(0, y);
        });
      }
    };
    scrollIfFocused();
  }, [focusedComment]); // eslint-disable-line

  const deletePost = () => {
    // TODO custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    dispatch(deleteComment(comment._id));
  };

  const cancel = () => {
    setActiveComment(null);
    setEditing(false);
  };

  if (!comment) return null;
  const isActive = activeComment === comment.id;

  const body = (
    <CommentBody
      comment={comment}
      inMainFeed={inMainFeed}
      preview={preview}
      avatarText={avatarText}
      noLink={noLink}
    />
  );

  const commentChildren = get(childComments, comment.id) || [];
  const borderMargin =
    hidePostButtons || screenSize
      ? (nestingLevel && -3) || 0
      : layout.POST_BUTTONS_WIDTH / 3;

  const popup = auth.user && auth.user._id === comment.user && (
    <Popup
      options={[
        { text: 'Edit Post', action: () => setEditing(true) },
        { text: 'Delete Post', action: () => deletePost() }
      ]}
    >
      <span className={'optionDots'}>...</span>
    </Popup>
  );

  return (
    <Box ref={el}>
      <Spacer
        nestingLevel={nestingLevel}
        additionalNesting={additionalNesting}
        screenSize={screenSize}
        fdirection="column"
      >
        <Box m={['0 3 0 0', `${preview ? '0 2 0 0' : '0 2 2 2'}`]}>
          {!hideBorder && (nestingLevel > 0 || inMainFeed) && (
            <Divider ml={borderMargin} />
          )}
          <View fdirection="row" mt={4}>
            {!hidePostButtons && !screenSize ? (
              <View w={layout.POST_BUTTONS_WIDTH}>
                <PostButtons post={comment} />
              </View>
            ) : null}
            {nestingLevel > 0 ? (
              <Image
                h={3}
                w={2}
                ml={[-3, 0]}
                mr={1}
                resizeMode={'contain'}
                source={require('app/public/img/reply.png')}
              />
            ) : null}

            <View fdirection="column" grow={1} shrink={1}>
              <CommentAuthor
                user={user}
                comment={comment}
                hideAvatar={hideAvatar}
                avatarText={avatarText}
                noLink={noLink}
                popup={!preview && popup}
                preview={preview}
              />
              <Box mt={[2, 2]} />
              {editing ? (
                <Box mt={2}>
                  <CommentForm
                    edit
                    p={['0 0 4 0', 2]}
                    parentPost={parentPost}
                    comment={comment}
                    buttonText={'Update'}
                    cancel={cancel}
                    nestingLevel={nestingLevel}
                    additionalNesting={additionalNesting}
                    autoFocus
                  />
                </Box>
              ) : (
                body
              )}
              {editing || hideReplyButtons || (hidePostButtons && preview) ? null : (
                <Box mb={[4, 2]}>
                  <ButtonRow {...props} post={comment} />
                </Box>
              )}
            </View>
          </View>
        </Box>
      </Spacer>

      {isActive && !editing && (
        <CommentForm
          parentPost={parentPost}
          nestingLevel={nestingLevel}
          p={[4, 2]}
          buttonText={'Comment'}
          additionalNesting={
            additionalNesting + (hidePostButtons ? 0 : layout.POST_BUTTONS_NESTING_UNITS)
          }
          parentComment={comment}
          cancel={cancel}
          autoFocus
        />
      )}
      {commentChildren.map(childId => (
        <Comment
          {...props}
          comment={posts.posts[childId]}
          key={childId}
          nestingLevel={nestingLevel + 1}
        />
      ))}
    </Box>
  );
}

export default Comment;
