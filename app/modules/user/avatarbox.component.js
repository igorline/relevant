import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import RStat from 'modules/stats/rStat.component';
import ULink from 'modules/navigation/ULink.component';
import Avatar from 'modules/user/UAvatar.component';
import { getTimestamp } from 'app/utils/numbers';
import styled from 'styled-components/primitives';
import { Text, View, SecondaryText, Image, BodyText } from 'modules/styled/uni';

export const Name = styled(BodyText)``;

export default function UserName(props) {
  const {
    user,
    showRelevance,
    type,
    setSelected,
    size,
    postTime,
    repost,
    condensedView,
    twitter,
    avatarText,
    noLink
  } = props;

  if (!user) return null;

  let { handle } = user;
  if (type !== 'invite' && handle) handle = `@${handle}`;

  let timestamp;
  if (postTime) {
    timestamp = getTimestamp(postTime);
  }

  const handleEl = handle && (
    <SecondaryText mt={0.25}>
      <SecondaryText>{handle}</SecondaryText> {timestamp}
    </SecondaryText>
  );

  const repostIcon = repost && (
    <Image
      resizeMode={'contain'}
      source={require('app/public/img/reposted.png')}
      w={2}
      h={2}
      mr={0.2}
      mb={2}
    />
  );

  const twitterIcon = twitter && (
    <Image
      inline
      resizeMode={'contain'}
      w={2.5}
      h={1.5}
      ml={0.5}
      mb={-0.1}
      source={require('app/public/img/icons/twitter_blue.png')}
    />
  );

  return (
    <ULink
      noLink={noLink}
      to={`/user/profile/${user.handle}`}
      onPress={() => setSelected(user)}
    >
      <View flex={1} fdirection={'row'}>
        <Avatar size={size} user={user} noLink />
        {repostIcon}
        <View
          ml={avatarText ? 1.5 : 1}
          justify={condensedView ? 'flex-start' : 'center'}
          flex={1}
        >
          <Text inline={1}>
            <Name inline={1} c={colors.black}>
              {user.name}
              {twitterIcon}
            </Name>
            {user.relevance && showRelevance && (
              <Text inline={1}>
                {' '}
                <RStat inline={1} align={'baseline'} lh={1.75} size={1.75} user={user} />
              </Text>
            )}
            {avatarText ? (
              <Text c={colors.black} inline={1}>
                {' '}
                {avatarText()}
              </Text>
            ) : null}
            {condensedView && handleEl}
          </Text>
          {!condensedView && handleEl}
        </View>
      </View>
    </ULink>
  );
}

UserName.propTypes = {
  noLink: PropTypes.bool,
  avatarText: PropTypes.func,
  twitter: PropTypes.bool,
  condensedView: PropTypes.bool,
  type: PropTypes.string,
  user: PropTypes.object,
  size: PropTypes.number,
  showRelevance: PropTypes.bool,
  repost: PropTypes.bool,
  postTime: PropTypes.string,
  setSelected: PropTypes.func
};
