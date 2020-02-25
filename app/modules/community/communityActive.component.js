import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';
import { View, CommunityLink, SecondaryText, BodyText, Box } from 'modules/styled/uni';
import { Linkify } from 'app/utils/text';
import { SIDE_NAV_PADDING } from 'styles/layout';
import { goToTopic } from 'modules/navigation/navigation.actions';
import { getCommunityMembers } from 'modules/community/community.actions';

CommunityActive.propTypes = {
  community: PropTypes.object,
  children: PropTypes.node,
  members: PropTypes.array,
  view: PropTypes.object,
  auth: PropTypes.object,
  screenSize: PropTypes.number,
  viewCommunityMembers: PropTypes.func,
  showSettings: PropTypes.func,
  userCommunities: PropTypes.array,
  userMemberships: PropTypes.array
};

export default memo(CommunityActive);

function CommunityActive({
  community,
  children,
  members,
  view,
  screenSize,
  auth,
  viewCommunityMembers,
  userCommunities,
  showSettings,
  userMemberships
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!members.length) dispatch(getCommunityMembers({ slug: community.slug }));
  }, []); // eslint-disable-line

  const topics = get(community, 'topics', []);
  const totalMembers = get(community, 'memberCount', 0);
  const userId = get(auth, 'user._id', null);
  const allMembers = members.filter(member => member.embeddedUser._id !== userId);
  let isMember;
  if (auth.user) {
    isMember = userCommunities.find(_id => _id === community._id);
    if (isMember) {
      allMembers.unshift({ _id: userId, embeddedUser: auth.user });
    }
  }
  const memberShip = userMemberships.find(m => m.communityId === community._id);
  const isSuperAdmin =
    (memberShip && memberShip.superAdmin) || get(auth, 'user.role') === 'admin';

  const limitedMembers = allMembers.slice(0, screenSize ? 14 : 12);
  const sort = get(view, 'sort') || 'new';
  return (
    <View bg={colors.white} mr={'1px'}>
      <View mt={[SIDE_NAV_PADDING, 2]} />
      {children}
      <View bb p={[`0 ${SIDE_NAV_PADDING} 4 ${SIDE_NAV_PADDING}`, '0 2 4 2']}>
        <View m={'0.5 0 0 5.5'}>
          {topics.map(topic => (
            <ULink
              key={topic}
              color={colors.grey}
              hc={colors.black}
              ac={colors.black}
              navLink
              onPress={() => dispatch(goToTopic(topic))}
              to={`/${community.slug}/${sort}/${topic}`}
            >
              <Box mt={0.5} mb={0.5}>
                <CommunityLink key={topic}>#{topic}</CommunityLink>
              </Box>
            </ULink>
          ))}
        </View>

        <View mt={[SIDE_NAV_PADDING, 2]}>
          <BodyText>
            <Linkify>{community.description}</Linkify>
          </BodyText>
        </View>

        <View mt={SIDE_NAV_PADDING} mb={2} fdirection="row" justify="space-between">
          <CommunityLink c={colors.black}>{`${totalMembers} Members`}</CommunityLink>
          <ULink
            inline={1}
            to="#"
            onPress={viewCommunityMembers}
            onClick={viewCommunityMembers}
          >
            <CommunityLink c={colors.blue}>See All</CommunityLink>
          </ULink>
        </View>

        <View fdirection={'row'} wrap>
          {limitedMembers.map(member => (
            <UAvatar key={member._id} user={member.embeddedUser} m={'0 1 1 0'} />
          ))}
        </View>

        {isSuperAdmin && (
          <SecondaryText
            mt={2}
            c={colors.blue}
            onPress={showSettings}
            key={'settings_'}
            p={'0.5 0'}
          >
            Settings
          </SecondaryText>
        )}
      </View>
    </View>
  );
}
