import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';
import { View, LinkFont, Header } from 'modules/styled/uni';

class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
    children: PropTypes.node,
    getCommunityMembers: PropTypes.func,
  };

  componentDidMount() {
    this.props.getCommunityMembers({ slug: this.props.community.slug });
  }

  render() {
    const { community, children } = this.props;
    const topics = get(community, 'topics', []);
    const members = get(community, 'members', []);
    const totalMembers = get(community, 'memberCount', 0);
    const limitedMembers = members.slice(0, 12);
    return (
      <View bg={colors.white} mr={'1px'} >
        <Header m={'4 4 3 4'}>Community</Header>
        {children}
        <View bb p={'0 4 4 4'}>
          <View m={'1 0 5 5.5'}>
            {topics.map(topic => (
              <LinkFont key={topic} p={'0.75 0'}>
                <ULink
                  color={colors.grey}
                  hc={colors.black}
                  ac={colors.black}
                  navLink
                  to={`/${community.slug}/new/${topic}`}>
                  #{topic}
                </ULink>
              </LinkFont>
            ))}
          </View>
          <LinkFont mb={2} c={colors.black}>
            {`${totalMembers} Members`}
          </LinkFont>
          <View direction={'row'} wrap>
            {limitedMembers.map(member => (
              <UAvatar
                key={member._id}
                user={member.embeddedUser}
                size={4}
                m={'0 1 1 0'}
              />
            ))}
          </View>
        </View>
      </View>);
  }
}

export default CommunityActive;
