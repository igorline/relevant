import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';
import { View, CommunityLink, SecondaryText } from 'modules/styled/uni';

class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
    children: PropTypes.node,
    getCommunityMembers: PropTypes.func,
    members: PropTypes.array,
    actions: PropTypes.object,
    view: PropTypes.object,
    auth: PropTypes.object,
    screenSize: PropTypes.number
  };

  componentDidMount() {
    const { members, community, getCommunityMembers } = this.props;
    if (!members.length) {
      getCommunityMembers({ slug: community.slug });
    }
  }

  componentDidUpdate(lastProps) {
    const { auth } = this.props;
    // Nasty code to get user to show up in members after first
    // action in an new community
    if (
      auth.user &&
      lastProps.auth.user &&
      auth.user.relevance &&
      !lastProps.auth.user.relevance
    ) {
      this.props.getCommunityMembers({ slug: this.props.community.slug });
    }
  }

  render() {
    const { community, children, members, actions, view, screenSize } = this.props;
    const topics = get(community, 'topics', []);
    const totalMembers = get(community, 'memberCount', 0);
    const limitedMembers = members.slice(0, screenSize ? 14 : 12);
    const sort = get(view, 'discover.sort') || 'new';
    return (
      <View bg={colors.white} mr={'1px'}>
        <View mt={[4, 2]} />
        {children}
        <View bb p={['0 4 4 4', '0 2 4 2']}>
          <View m={'0.5 0 0 5.5'}>
            {topics.map(topic => (
              <ULink
                key={topic}
                color={colors.grey}
                hc={colors.black}
                ac={colors.black}
                navLink
                onPress={() => actions.goToTopic(topic)}
                to={`/${community.slug}/${sort}/${topic}`}
              >
                <CommunityLink key={topic} p={'0.5 0'}>
                  #{topic}
                </CommunityLink>
              </ULink>
            ))}
          </View>
          <SecondaryText mt={3}>{community.description}</SecondaryText>
          <CommunityLink mt={3} mb={2} c={colors.black}>
            {`${totalMembers} Members`}
          </CommunityLink>
          <View fdirection={'row'} wrap>
            {limitedMembers.map(member => (
              <UAvatar
                key={member._id}
                user={member.embeddedUser}
                size={4}
                actions={actions}
                m={'0 1 1 0'}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }
}

export default CommunityActive;
