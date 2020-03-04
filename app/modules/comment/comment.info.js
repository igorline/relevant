import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { UserName } from 'modules/user/avatarbox.component';
import AvatarBox from 'modules/user/UAvatar.component';
import { View, SecondaryText, InlineText } from 'modules/styled/uni';
import { getTimestamp } from 'app/utils/numbers';
import ULink from 'modules/navigation/ULink.component';
import { CommentEl, TagEl } from 'modules/post/postTitle.component';
import { goToProfile } from 'modules/navigation/navigation.actions';
// import { getTitle } from 'utils/text';

CommentInfo.propTypes = {
  comment: PropTypes.object,
  user: PropTypes.object
};

export default memo(CommentInfo);

function CommentInfo({ comment, user }) {
  // const { isHeading, titleText } = getTitle(comment.body);
  // {isHeading && <Header inline={1}>{titleText}</Header>}
  // {!isHeading && titleText && <Highlight>{titleText}</Highlight>}

  user = user || comment.embeddedUser;

  return (
    <View fdirection="row" align={'center'}>
      <AvatarBox size={7} vertical user={user} />
      <View ml={[2, 2]} mr={[3, 2]}>
        <InfoRow comment={comment} />
        <View
          fdirection={'row'}
          wrap={'wrap'}
          align={'flex-end'}
          h={2}
          style={{ overflow: 'hidden' }}
          mt={0.5}
          numberOfLines={1}
        >
          <CommentEl post={comment} postUrl />
          <TagEl post={comment} />
        </View>
      </View>
    </View>
  );
}

InfoRow.propTypes = {
  comment: PropTypes.object
};

function InfoRow({ comment }) {
  const dispatch = useDispatch();
  const postTime = comment.createdAt;

  const timestamp = !!postTime && ' • ' + getTimestamp(postTime);
  const { handle } = comment.embeddedUser;

  return (
    <ULink to={`/user/profile/${handle}`} onPress={() => dispatch(goToProfile(handle))}>
      <InlineText>
        <UserName user={comment.embeddedUser} showRel />
        <SecondaryText mt={0.25}>
          {'\n'}@{handle} {timestamp}
        </SecondaryText>
      </InlineText>
    </ULink>
  );
}
