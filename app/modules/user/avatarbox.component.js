import React from 'react';
import { Image, Touchable } from 'react-primitives';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import RStat from 'modules/stats/rStat.component';
import ULink from 'modules/navigation/ULink.component';
import Avatar from 'modules/user/UAvatar.component';
import { getTimestamp } from 'app/utils/numbers';
import styled from 'styled-components/primitives';
import { Text, View, SecondaryText } from 'modules/styled/uni';

export const Name = styled(Text)`
  font-weight: bold'
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
    condensedView
    // twitter
  } = props;

  if (!user) return null;

  let { handle } = user;
  if (type !== 'invite' && handle) handle = `@${handle}`;

  let timestamp;
  if (postTime) {
    timestamp = getTimestamp(postTime);
  }

  const handleEl = handle && <SecondaryText >
    <SecondaryText>{handle}</SecondaryText> {timestamp}
  </SecondaryText>;


  const repostIcon = repost && (
    <Image
      resizeMode={'contain'}
      source={require('app/public/img/reposted.png')}
      style={{ width: 15, height: 15, marginRight: 3, marginBottom: 14 }}
    />
  );

  const twitterIcon = null;
  // TODO: Get Icons to work with SVG
  // const twitterIcon = twitter && (
  //   <Image
  //     borderRadius={0}
  //     name={'logo-twitter'}
  //     size={17}
  //     color={'#00aced'}
  //     style={styles.icon}
  //   />
  // );

  return (
    <ULink to={`/user/profile/${user.handle}`}>
      <Touchable
        onPress={() => setSelected(user)}
      >
        <View flex={1} direction={'row'}>
          <Avatar size={size} user={user} noLink />
          {repostIcon}
          <View ml={1} justify={condensedView ? 'flex-start' : 'center'}>
            <View direction={'row'} align={'baseline'}>
              <Name mr={0.75} c={colors.black}>
                {user.name}{twitterIcon && ' ' + twitterIcon}
              </Name>
              {user.relevance &&
                showRelevance &&
                <RStat align='baseline' mr={0.75} size={1.75} user={user} />}
              {condensedView && handleEl}
            </View>
            {!condensedView && handleEl}
          </View>
        </View>
      </Touchable>
    </ULink>
  );
}

UserName.propTypes = {
  // twitter: PropTypes.bool,
  condensedView: PropTypes.bool,
  type: PropTypes.string,
  user: PropTypes.object,
  size: PropTypes.number,
  showRelevance: PropTypes.bool,
  repost: PropTypes.bool,
  postTime: PropTypes.string,
  setSelected: PropTypes.func
};
