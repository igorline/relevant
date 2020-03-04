import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { resetTabs, closeDrawer } from 'modules/navigation/navigation.actions';
import { setCommunity } from 'modules/auth/auth.actions';
import { css } from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import CommunityActive from 'modules/community/communityActive.component';
import CommunityListItem from 'modules/community/communityListItem.component';
import get from 'lodash/get';
import { View, BodyText, Badge } from 'modules/styled/uni';
import { SIDE_NAV_PADDING } from 'styles/layout';
import { useUnread } from './hooks';

// TODO: change to work like in the communityActive component
const linkStyle = css`
  display: flex;
  align-items: center;
  color: ${colors.black};
  &:hover > div > div:first-child {
    text-decoration: underline;
    text-decoration-color: ${colors.black};
  }
  &:hover {
    background: ${colors.white};
  }
`;

Community.propTypes = {
  viewCommunityMembers: PropTypes.func,
  showSettings: PropTypes.func
};

export function Community({ viewCommunityMembers, showSettings }) {
  const community = useSelector(state => state.community);
  const auth = useSelector(state => state.auth);
  const view = useSelector(state => state.navigation.discover);
  const screenSize = useSelector(state => state.navigation.screenSize);

  const {
    communityMembers,
    members,
    communities,
    userCommunities,
    userMemberships
  } = community;

  const activeCommunity = communities[community.active];
  const activeMembers = get(communityMembers, community.active, []).map(
    id => members[id]
  );
  return (
    <View flex={1}>
      <View bb>
        {activeCommunity && (
          <CommunityActive
            key={activeCommunity._id}
            community={activeCommunity}
            userCommunities={userCommunities}
            userMemberships={userMemberships}
            members={activeMembers}
            screenSize={screenSize}
            viewCommunityMembers={viewCommunityMembers}
            showSettings={showSettings}
            view={view}
            auth={auth}
          >
            <MemoCommunityLink community={activeCommunity} active />
          </CommunityActive>
        )}
        <View m={'2 0'}>
          <OtherCommunities />
        </View>
      </View>

      <BodyText m={[SIDE_NAV_PADDING, 2]}>
        We'll be adding more communities soon!{'\n\n'}
      </BodyText>
    </View>
  );
}

const OtherCommunities = memo(() => {
  const { communities, list, active } = useSelector(state => state.community);
  return list
    .map(id => communities[id])
    .filter(community => community && active !== community.slug)
    .map(community => <MemoCommunityLink key={community._id} community={community} />);
});

CommunityLink.propTypes = {
  community: PropTypes.object,
  active: PropTypes.bool
};

const MemoCommunityLink = memo(CommunityLink);

function CommunityLink({ community, active }) {
  const dispatch = useDispatch();
  const unread = useUnread(community, active);

  return (
    <ULink
      flex={1}
      styles={linkStyle}
      key={community._id}
      to={'/' + community.slug + '/new'}
      onPress={() => {
        dispatch(closeDrawer());
        requestAnimationFrame(() => {
          dispatch(setCommunity(community.slug));
          dispatch(resetTabs());
        });
      }}
    >
      <View flex={1} fdirection={'row'} align={'center'} justify={'space-between'}>
        <CommunityListItem community={community} p={[`1 ${SIDE_NAV_PADDING}`, '1 2']} />
        <Badge mr={[SIDE_NAV_PADDING, 2]} number={unread} />
      </View>
    </ULink>
  );
}

export default memo(Community);
