import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import RStat from 'modules/stats/rStat.component';
import ULink from 'modules/navigation/ULink.component';
import Avatar from 'modules/user/UAvatar.component';
import { getTimestamp } from 'app/utils/numbers';
import styled from 'styled-components/primitives';
import { Text, View, SecondaryText, Image } from 'modules/styled/uni';

export const Name = styled(Text)`
  font-weight: bold';
  * {
    fill: red;
    stroke: green;
  }
`;

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
    twitter
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
      resizeMode={'contain'}
      w={2.5}
      h={1.5}
      ml={0.5}
      mb={-0.1}
      source={require('app/public/img/icons/twitter_blue.png')}
    />
  );

  return (
    <ULink to={`/user/profile/${user.handle}`} onPress={() => setSelected(user)}>
      <View flex={1} fdirection={'row'}>
        <Avatar size={size} user={user} noLink />
        {repostIcon}
        <View ml={1} justify={condensedView ? 'flex-start' : 'center'}>
          <View fdirection={'row'} align={'baseline'}>
            <Name mr={0.75} c={colors.black}>
              {user.name}
              {twitterIcon}
            </Name>
            {user.relevance && showRelevance && (
              <RStat align={'baseline'} mr={0.75} lh={1.75} size={1.75} user={user} />
            )}
            {condensedView && handleEl}
          </View>
          {!condensedView && handleEl}
        </View>
      </View>
    </ULink>
  );
}

UserName.propTypes = {
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
