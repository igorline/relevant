import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-primitives';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import PropTypes from 'prop-types';
import { globalStyles, darkGrey } from 'app/styles/global';
import Stats from 'modules/stats/mobile/stats.component';
import ULink from 'modules/navigation/ULink.component';
import { getTimestamp } from 'app/utils/numbers';
import styled, { css } from 'styled-components/primitives';

let styles;

const bebas = css`
  font-family: BebasNeueRelevantRegular;
  margin-bottom: -2px;
`;

const font17 = css`
  font-size: 17px;
  lineHeight: 17px;
`;

export const Name = styled.Text`
  color: ${darkGrey};
  ${font17}
  ${bebas}
`;

export const HandleText = styled.Text`
  ${globalStyles.font10}
  ${globalStyles.greyText}
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

  const twitterIcon = twitter && (
    <Icon
      borderRadius={0}
      name={'logo-twitter'}
      size={17}
      color={'#00aced'}
      style={styles.icon}
    />
  );

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
              {user.relevance && relevance && <Stats entity={user} type={'relevance'} />}
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

styles = { ...localStyles, ...globalStyles };
