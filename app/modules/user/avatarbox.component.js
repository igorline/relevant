import React from 'react';
import { View, Image, Text } from 'react-primitives';
import PropTypes from 'prop-types';
// import { globalStyles, darkGrey } from 'app/styles/global';
import { colors, sizing } from 'app/styles/globalStyles';
// TODO: rewrite this as a universal component
// import Stats from 'modules/stats/mobile/stats.component';
import ULink from 'modules/navigation/ULink.component';
import Avatar from 'modules/user/UAvatar.component';

import { getTimestamp } from 'app/utils/numbers';
// import { } from 'modules/styled/Text.component';
import styled from 'styled-components/primitives';

let styles = {};

export const Name = styled.Text`
  font-size: ${sizing.byUnit(2)};
  line-height: ${sizing.byUnit(2)};
  color: ${colors.blue};
`;

export const HandleText = styled.Text`
  font-size: ${sizing.byUnit(1.25)};
  color: ${colors.secondaryText};
`;

export const Wrapper = styled.Touchable`
`;

export const AvatarContainer = styled.View`
  display: flex;
  flex: 1;
  flexDirection: row;
  align-items: center;
  justify-content: flex-start;
`;

export const TextContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin: 0 0 0 5px;
`;

export default function UserName(props) {
  const { user, relevance, type, topic, setSelected, size, postTime, repost, twitter } = props;

  if (!user) return null;

  let { handle } = user;
  if (type !== 'invite' && handle) handle = `@${handle}`;

  let timestamp;
  if (postTime) {
    timestamp = getTimestamp(postTime);
  }

  const rIcon = (
    <Image
      resizeMode={'contain'}
      style={[styles.smallR, { width: 10, height: 12, marginRight: 1 }]}
      source={require('app/public/img/icons/smallR.png')}
    />
  );

  const handleEl = handle && topic && topic.topic ? ( // TODO WILL BE DEPRECATED
    <View>
      <HandleText>
        {handle + ' • '}
      </HandleText>
      {rIcon}
      <Text style={[styles.font10, styles.greyText]}>
        {Math.round(topic.relevance)} in #{topic.topic}
      </Text>
    </View>
  ) : handle && <HandleText style={[styles.font10, styles.greyText]}>
    {handle} {timestamp}
  </HandleText>;


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
      <Wrapper
        onPress={() => setSelected(user)}
      >
        <AvatarContainer>
          <Avatar size={size} user={user} noLink />
          {repostIcon}
          <TextContainer>
            <View>
              <Name>
                {user.name}{twitterIcon && ' ' + twitterIcon}
              </Name>
              {user.relevance && relevance && 'STATS GO HERE'}
            </View>
            {handleEl}
          </TextContainer>
        </AvatarContainer>
      </Wrapper>
    </ULink>
  );
}

UserName.propTypes = {
  topic: PropTypes.object,
  twitter: PropTypes.bool,
  type: PropTypes.string,
  user: PropTypes.object,
  size: PropTypes.number,
  relevance: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repost: PropTypes.bool,
  postTime: PropTypes.string,
  setSelected: PropTypes.func
};
