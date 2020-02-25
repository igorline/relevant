import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { layout } from 'app/styles';
import SingleComment from 'modules/comment/web/singleComment.container';
import PostButtons from 'modules/post/vote-buttons/postbuttons.container';
import PostInfo from 'modules/post/postinfo.component';
import { View, Text, Divider } from 'modules/styled/uni';
import ButtonRow from 'modules/post/web/buttonRow.component';
import { MAX_POST_WIDTH } from 'styles/layout';

Post.propTypes = {
  post: PropTypes.object,
  link: PropTypes.object,
  noComments: PropTypes.bool,
  comment: PropTypes.object,
  hideDivider: PropTypes.bool,
  hidePostButtons: PropTypes.bool,
  hideAvatar: PropTypes.bool,
  noLink: PropTypes.bool,
  preview: PropTypes.bool,
  avatarText: PropTypes.func,
  singlePost: PropTypes.bool,
  children: PropTypes.node
};

export default memo(Post);

function Post({
  post,
  noComments,
  link,
  hideDivider,
  hidePostButtons,
  comment,
  hideAvatar,
  noLink,
  preview,
  avatarText,
  singlePost,
  children
}) {
  const screenSize = useSelector(state => state.navigation.screenSize);

  if (!post) return null;

  const isLink = post.type === 'link';

  if (post === 'notFound') {
    return (
      <View>
        <Text>Post not found</Text>
      </View>
    );
  }
  if (!post) return null;

  const parentPost = post.parentPost || post;
  const renderComment = !noComments && comment;

  // TODO pass post buttons as prop to Post?
  const postEl = isLink ? (
    <View fdirection={'row'} m={[`4 3 ${renderComment ? 0 : 3} 0`, 0]}>
      {!hidePostButtons && !screenSize && (
        <View w={layout.POST_BUTTONS_WIDTH}>
          <PostButtons post={post} />
        </View>
      )}
      <View flex={1}>
        <PostInfo post={post} link={link} noLink={noLink} singlePost={singlePost} />
        {screenSize > 0 ? (
          <View m={2}>
            <ButtonRow
              post={post}
              hidePostButtons={hidePostButtons}
              parentPost={parentPost}
            />
          </View>
        ) : null}
      </View>
    </View>
  ) : (
    <SingleComment
      hideAvatar={hideAvatar}
      comment={post}
      parentPost={post}
      hidePostButtons={hidePostButtons}
      additionalNesting={0}
      nestingLevel={0}
      hideBorder
      noLink={noLink}
      avatarText={avatarText}
      preview={preview}
      inMainFeed={!singlePost}
    />
  );

  const additionalNesting =
    hidePostButtons || screenSize ? 0 : layout.POST_BUTTONS_NESTING_UNITS;

  const commentEl = renderComment ? (
    <SingleComment
      comment={comment}
      parentPost={parentPost}
      hidePostButtons={screenSize === 0}
      hideBorder={isLink && !screenSize}
      additionalNesting={additionalNesting}
      nestingLevel={isLink ? 0 : 1}
      preview={preview}
      inMainFeed
    />
  ) : null;

  const previewEl = preview && link && (link.url || link.image) && (
    <View m={['4 0 0 0']}>
      <PostInfo post={post} link={link} noLink={noLink} preview={preview} />
    </View>
  );

  return (
    <View maxWidth={MAX_POST_WIDTH} fdirection={'column'}>
      {previewEl}
      {isLink && previewEl ? <View mt={2} /> : postEl}
      {commentEl}
      {children}
      {hideDivider ? null : <Divider m={['0 4', 0]} screenSize={screenSize} />}
    </View>
  );
}

// TODO use this for editing posts
// editPost() {
//   const { post, link = {} } = this.props;
//   this.props.actions.clearCreatePost();
//   const editPost = {
//     edit: true,
//     editPost: post,
//     postBody: post.body,
//     postCategory: post.category,
//     allTags: post.tags,
//     selectedTags: post.tags,
//     // do we need these here?
//     postImage: link.image,
//     postUrl: link.url,
//     urlPreview: {
//       title: link.title,
//       url: link.url,
//       image: link.image,
//       domain: link.domain
//     }
//   };
//   this.props.actions.setCreatePostState(editPost);
//   this.props.history.push(history.location.pathname + '#newpost');
// }
