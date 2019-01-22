import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-primitives';
import PropTypes from 'prop-types';
// import { globalStyles, darkGrey } from 'app/styles/global';
import { colors, sizing } from 'app/styles/globalStyles';
// TODO: rewrite this as a universal component
// import Stats from 'modules/stats/mobile/stats.component';
import ULink from 'modules/navigation/ULink.component';
import { getTimestamp } from 'app/utils/numbers';
// import { } from 'modules/styled/Text.component';
import styled from 'styled-components/primitives';

let styles;


export const Name = styled.Text`
  color: ${colors.secondaryText};
`;

export const HandleText = styled.Text`
  font-size: ${sizing.byUnit(1.25)};
  color: ${colors.secondaryText};
`;

export const Wrapper = styled.Touchable`
`;

export default function UserName(props) {
  const { user, relevance, type, topic, setSelected, big, postTime, repost, twitter } = props;

  if (!user) return null;

  const { userImageBig, userImage, postInfo } = styles;
  const imageSource = user.image ? { uri: user.image } : require('app/public/img/default_user.jpg');
  const imageStyle = big ? userImageBig : userImage;

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
    <View style={styles.textRow}>
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
        <View style={postInfo}>
          <Image source={imageSource} style={imageStyle} />
          {repostIcon}
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                marginBottom: 2
              }}
            >
              <Name>
                {user.name}{twitterIcon && ' ' + twitterIcon}
              </Name>
              {user.relevance && relevance && 'STATS GO HERE'}
            </View>
            {handleEl}
          </View>
        </View>
      </Wrapper>
    </ULink>
  );
}

UserName.propTypes = {
  topic: PropTypes.object,
  twitter: PropTypes.bool,
  type: PropTypes.string,
  user: PropTypes.object,
  big: PropTypes.bool,
  relevance: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repost: PropTypes.bool,
  postTime: PropTypes.string,
  setSelected: PropTypes.func
};

const localStyles = StyleSheet.create({
  icon: {
    marginLeft: 5
  },
  userImageBig: {
    height: 42,
    width: 42,
    borderRadius: 21,
    marginRight: 7
  },
  postInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  }
});

styles = { ...localStyles };
