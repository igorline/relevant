import React from 'react';
import { View, CTALink } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import PostButtons from 'modules/post/postbuttons.component';
import { copyToClipBoard } from 'app/utils/text';

export default function PostButtonRow(props) {
  const {
    post,
    hidePostButtons,
    screenSize,
    setActiveComment,
    parentPost,
    auth,
    actions,
    enableTips
  } = props;

  const localUrl = `/${auth.community}/post/${parentPost ? parentPost._id : post._id}`;
  const url = `https://${window.location.host}${localUrl}`;

  return (
    <View
      fdirection="row"
      justify="space-between"
      align="center"
      wrap={1}
      // stop-gap to avoid the page dimenisons breaking on deeply nested comments
    >
      {!hidePostButtons && screenSize ? (
        <View w={12}>
          <PostButtons {...props} post={post} horizontal />
        </View>
      ) : null}
      <View fdirection="row">
        <ULink
          hu
          to={setActiveComment ? '#' : localUrl}
          inline
          authrequired={true}
          onClick={e => {
            if (!setActiveComment) return;
            e.preventDefault();
            setActiveComment(post.id);
          }}
          onPress={e => {
            e.preventDefault();
            setActiveComment(post.id);
          }}
        >
          <CTALink mr={3} c={colors.blue}>
            {parentPost ? 'Reply' : 'Comment'}
          </CTALink>
        </ULink>
        <ULink
          hu
          to="#"
          authrequired={true}
          inline
          onClick={e => {
            e.preventDefault();
            copyToClipBoard(url);
          }}
          onPress={e => {
            e.preventDefault();
            copyToClipBoard(url);
          }}
        >
          <CTALink c={colors.blue}>Share</CTALink>
        </ULink>
        {enableTips && (
          <ULink
            hu
            to="#"
            authrequired={true}
            inline
            onClick={e => {
              e.preventDefault();
              actions.showModal('tipModal');
            }}
            onPress={e => {
              e.preventDefault();
              actions.showModal('tipModal');
            }}
          >
            <CTALink c={colors.blue}>Tip</CTALink>
          </ULink>
        )}
      </View>
    </View>
  );
}

PostButtonRow.propTypes = {
  post: PropTypes.object,
  hidePostButtons: PropTypes.bool,
  screenSize: PropTypes.number,
  setActiveComment: PropTypes.func,
  parentPost: PropTypes.object,
  auth: PropTypes.object,
  actions: PropTypes.object,
  enableTips: PropTypes.bool
};
