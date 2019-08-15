import React from 'react';
import { View, CTALink } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import PostButtons from 'modules/post/vote-buttons/postbuttons.container';
import { copyToClipBoard } from 'app/utils/text';
import { getPostUrl } from 'app/utils/post';

export default function PostButtonRow(props) {
  const { post, hidePostButtons, screenSize, setActiveComment, parentPost, auth } = props;
  const url = 'https://relevant.community' + getPostUrl(auth.community, post);

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
          to={setActiveComment ? '#' : url}
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
  auth: PropTypes.object
};
