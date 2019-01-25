import React from 'react';
import { Image } from 'react-primitives';
import PropTypes from 'prop-types';
import { colors, sizing, layout, fonts } from 'app/styles/globalStyles';
import RStat from 'modules/stats/rStat.component';
import ULink from 'modules/navigation/ULink.component';
import Avatar from 'modules/user/UAvatar.component';
import { getTimestamp } from 'app/utils/numbers';
import styled from 'styled-components/primitives';


export const Name = styled.Text`
  font-size: ${sizing.byUnit(2)};
  line-height: ${sizing.byUnit(2)};
  color: ${colors.black};
  ${fonts.HelveticaNeueCondensedBold}
  margin-right: ${sizing.byUnit(1)};
`;

export const HandleText = styled.Text`
  font-size: ${sizing.byUnit(1.25)};
  line-height: ${sizing.byUnit(1.25)};
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
  margin: 0 0 0 ${sizing.byUnit(1)};
`;

const TextRow = styled.View`
  ${layout.textRow}
  margin-bottom: 2px;
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
    // twitter
  } = props;

  if (!user) return null;

  let { handle } = user;
  if (type !== 'invite' && handle) handle = `@${handle}`;

  let timestamp;
  if (postTime) {
    timestamp = getTimestamp(postTime);
  }

  const handleEl = handle && <HandleText>
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
            <TextRow>
              <Name>
                {user.name}{twitterIcon && ' ' + twitterIcon}
              </Name>
              {user.relevance && showRelevance && <RStat size={1.75} user={user} />}
            </TextRow>
            {handleEl}
          </TextContainer>
        </AvatarContainer>
      </Wrapper>
    </ULink>
  );
}

UserName.propTypes = {
  // twitter: PropTypes.bool,
  type: PropTypes.string,
  user: PropTypes.object,
  size: PropTypes.number,
  showRelevance: PropTypes.bool,
  repost: PropTypes.bool,
  postTime: PropTypes.string,
  setSelected: PropTypes.func
};
