import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import styled from 'styled-components/primitives';
import { StyleSheet } from 'react-primitives';
import { colors } from 'app/styles/globalStyles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';

const greyText = '#717171';

const StyledAvatar = styled(UAvatar)`
  margin-right: 0.5em;
`;

const NavSection = styled.View`
  padding: 2em;
  borderBottomColor: ${colors.lineColor};
  borderBottomWidth: ${StyleSheet.hairlineWidth};
`;

const MemberContainer = styled.View`
  margin-bottom: 1em;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const TopicsContainer = styled.View`
  margin: 1em 0 0 1em;
`;

// TODO: match to style guide once we get it e.g. h2, h3
const MemberCount = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: 1em;
`;

const topicStyles = `
  color: ${greyText};
  &:hover {
    color: black;
  }
  &.active {
    color: black;
  }
`;

const StyledCommunityList = styled.View`
`;

class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
    children: PropTypes.array,
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
      <StyledCommunityList>
        <NavSection>
          {children}
          <TopicsContainer>
            {topics.map(topic => (
              <ULink navLink key={topic} to={`/${community.slug}/new/${topic}`} styles={topicStyles}>
                #{topic}
              </ULink>
            ))}
          </TopicsContainer>
        </NavSection>
        <NavSection>
          <MemberCount>{`${totalMembers} Members`}</MemberCount>
          <MemberContainer>
            {limitedMembers.map(member => (
              <StyledAvatar
                key={member._id}
                user={member.embeddedUser}
              />
            ))}
          </MemberContainer>
        </NavSection>
      </StyledCommunityList>);
  }
}

export default CommunityActive;
