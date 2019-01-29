import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import styled from 'styled-components/primitives';
import { colors, sizing, mixins, fonts, layout } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';

const IconLink = styled.Text`
  ${fonts.link}
`;

const StyledHeader = styled.Text`
  ${fonts.header}
  ${mixins.margin}
`;

const NavSection = styled.View`
  padding: 0 ${sizing(4)} ${sizing(4)};
  ${layout.universalBorder('bottom')}
`;

const MemberContainer = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const View = styled.View`
  ${mixins.margin}
`;

// TODO: match to style guide once we get it e.g. h2, h3
const MemberCount = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: ${sizing(2)};
`;

const topicStyles = `
  color: ${colors.grey};
  &:hover {
    color: ${colors.black};
  }
  &.active {
    color: ${colors.black};
  }
`;

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
      <View c={colors.white} >
        <StyledHeader m={`${sizing(4)} ${sizing(4)} ${sizing(3)} ${sizing(4)}`}>Community</StyledHeader>
        {children}
        <NavSection>
          <View margin={`${sizing(1)} 0 ${sizing(6)} ${sizing(5.5)}`}>
            {topics.map(topic => (
              <IconLink key={topic}>
                <ULink navLink to={`/${community.slug}/new/${topic}`} styles={topicStyles}>
                  #{topic}
                </ULink>
              </IconLink>
            ))}
          </View>
          <MemberCount>{`${totalMembers} Members`}</MemberCount>
          <MemberContainer>
            {limitedMembers.map(member => (
              <UAvatar
                key={member._id}
                user={member.embeddedUser}
                size={4}
                m={`0 ${sizing(1)} ${sizing(1)} 0`}
              />
            ))}
          </MemberContainer>
        </NavSection>
      </View>);
  }
}

export default CommunityActive;
