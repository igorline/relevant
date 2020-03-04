import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { colors, isNative } from 'app/styles';
import RStat from 'modules/stats/rStat.component';
import ULink from 'modules/navigation/ULink.component';
import Avatar from 'modules/user/UAvatar.component';
import { getTimestamp } from 'app/utils/numbers';
import styled from 'styled-components/primitives';
import { Text, View, SecondaryText, Image, BodyText, Box } from 'modules/styled/uni';
import sizing from 'styles/sizing';
import { goToProfile } from 'modules/navigation/navigation.actions';

export const Name = styled(BodyText)``;

export default memo(AvatarBox);

AvatarBox.propTypes = {
  noLink: PropTypes.bool,
  avatarText: PropTypes.func,
  twitter: PropTypes.bool,
  type: PropTypes.string,
  user: PropTypes.object,
  size: PropTypes.number,
  showRelevance: PropTypes.bool,
  repost: PropTypes.bool,
  postTime: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setSelected: PropTypes.func,
  navigationCallback: PropTypes.func,
  vertical: PropTypes.bool
};

function AvatarBox(props) {
  const {
    user,
    showRelevance,
    type,
    setSelected,
    size,
    postTime,
    repost,
    twitter,
    avatarText,
    noLink,
    navigationCallback,
    vertical
  } = props;
  const dispatch = useDispatch();

  if (!user) return null;

  let { handle } = user;
  if (type !== 'invite' && handle) handle = `@${handle}`;

  let timestamp;
  if (postTime) {
    timestamp = ' • ' + getTimestamp(postTime);
  }

  const handleEl = handle && !vertical && (
    <SecondaryText mt={0.25}>
      {handle} {timestamp}
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

  const showRel =
    user.relevance && !!user.relevance.pagerank && showRelevance && !avatarText;

  return (
    <Box>
      <ULink
        noLink={noLink}
        to={`/user/profile/${user.handle}`}
        onPress={() => {
          setSelected ? setSelected(user) : dispatch(goToProfile(user));
          navigationCallback && navigationCallback();
        }}
        onClick={() => navigationCallback && navigationCallback()}
      >
        <View flex={1} fdirection={vertical ? 'column' : 'row'}>
          <Avatar size={size} user={user} noLink />
          {repostIcon}
          <View
            ml={vertical ? 0 : avatarText ? 1.5 : 1}
            align={vertical ? 'center' : 'flex-start'}
            justify={'center'}
          >
            <Text mt={vertical ? 1 : 0} inline={1}>
              <UserName user={user} showRel={showRel} twitterIcon={twitterIcon} />
              {avatarText ? (
                <Text c={colors.black} inline={1}>
                  {' '}
                  {avatarText()}
                </Text>
              ) : null}
            </Text>
            {handleEl}
          </View>
        </View>
      </ULink>
    </Box>
  );
}

UserName.propTypes = {
  user: PropTypes.object,
  twitterIcon: PropTypes.node,
  showRel: PropTypes.bool
};

export function UserName({ user, showRel, twitterIcon }) {
  const elipses = isNative
    ? {}
    : {
        // overflowText: 'elipses',
        // display: 'inline-block',
        // verticalAlign: 'bottom',
        maxWidth: sizing(12),
        whiteSpace: 'nowrap'
      };
  return (
    <Fragment>
      <Name
        numberOfLines={1}
        style={{
          overflow: 'hidden',
          ...elipses
        }}
        inline={1}
        c={colors.black}
      >
        {user.name}
        {twitterIcon}
      </Name>
      {showRel && (
        <Text inline={1}>
          {' '}
          <RStat inline={1} align={'baseline'} lh={1.75} size={1.75} user={user} />
        </Text>
      )}
    </Fragment>
  );
}
