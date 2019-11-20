import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { resetTabs } from 'modules/navigation/navigation.actions';
import { setCommunity } from 'modules/auth/auth.actions';
import { css } from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import CommunityActive from 'modules/community/communityActive.component';
import CommunityListItem from 'modules/community/communityListItem.component';
import get from 'lodash/get';
import { View, BodyText, Badge } from 'modules/styled/uni';
import { SIDE_NAV_PADDING } from 'styles/layout';
import {
  useQuery,
  useApolloClient,
  useMutation,
  useSubscription
} from '@apollo/react-hooks';
import { MY_MEMBERSHIPS, CLEAR_UNREAD, INC_UNREAD } from './queries';

// TODO: change to work like in the communityActive component
const linkStyle = css`
  display: flex;
  align-items: center;
  color: ${colors.black};
  &:hover > div:first-child {
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
  const view = useSelector(state => state.view);
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
            <CommunityLink community={activeCommunity} active />
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

function OtherCommunities() {
  const { communities, list, active } = useSelector(state => state.community);
  return list
    .map(id => communities[id])
    .filter(community => community && active !== community.slug)
    .map(community => <CommunityLink key={community._id} community={community} />);
}

CommunityLink.propTypes = {
  community: PropTypes.object,
  active: PropTypes.bool
};

function CommunityLink({ community, active }) {
  const dispatch = useDispatch();
  const { unread } = useUnread(community, active);

  return (
    <ULink
      flex={1}
      styles={linkStyle}
      key={community._id}
      to={'/' + community.slug + '/new'}
      onPress={() => {
        dispatch(resetTabs());
        requestAnimationFrame(() => {
          dispatch(setCommunity(community.slug));
        });
      }}
    >
      <CommunityListItem community={community} p={[`1 ${SIDE_NAV_PADDING}`, '1 2']} />
      <Badge mr={[SIDE_NAV_PADDING, 2]} number={unread} />
    </ULink>
  );
}

function useUnread(community, active) {
  const client = useApolloClient();
  const { data = { myMemberships: [] } } = useQuery(MY_MEMBERSHIPS);
  const [clearUnread] = useMutation(CLEAR_UNREAD);

  const { myMemberships } = data;
  const membership =
    myMemberships && myMemberships.find(m => m.communityId === community._id);
  const unread = membership && membership.unread;
  const total = myMemberships.reduce((a, m) => a + m.unread, 0);

  useSubscription(INC_UNREAD, {
    variables: { communities: [community._id] },
    onSubscriptionData: () => {
      membership.unread++;
      client.writeQuery({ query: MY_MEMBERSHIPS, data });
    }
  });

  if (unread && active && membership) {
    membership.unread = 0;
    client.writeQuery({ query: MY_MEMBERSHIPS, data });
    clearUnread({ variables: { _id: membership._id } });
  }
  return { unread, total };
}

export default Community;
