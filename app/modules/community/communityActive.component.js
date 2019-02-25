import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';
import { View, CommunityLink, Header } from 'modules/styled/uni';

class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
    children: PropTypes.node,
    getCommunityMembers: PropTypes.func,
    members: PropTypes.array,
    mobile: PropTypes.bool,
    actions: PropTypes.object
  };

  componentDidMount() {
    this.props.getCommunityMembers({ slug: this.props.community.slug });
  }

  render() {
    const { community, children, members, mobile, actions } = this.props;
    const topics = get(community, 'topics', []);
    const totalMembers = get(community, 'memberCount', 0);
    const limitedMembers = members.slice(0, mobile ? 14 : 12);
    const p = mobile ? 2 : 4;
    return (
      <View bg={colors.white} mr={'1px'}>
        <Header m={`4 ${p} 3 ${p}`}>Community</Header>
        {children}
        <View bb p={`0 ${p} 4 ${p}`}>
          <View m={'0.5 0 4 5.5'}>
            {topics.map(topic => (
              <ULink
                key={topic}
                color={colors.grey}
                hc={colors.black}
                ac={colors.black}
                navLink
                onPress={() => actions.goToTopic(topic)}
                to={`/${community.slug}/new/${topic}`}
              >
                <CommunityLink key={topic} p={'0.5 0'}>
                  #{topic}
                </CommunityLink>
              </ULink>
            ))}
          </View>
          <CommunityLink mb={2} c={colors.black}>
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
