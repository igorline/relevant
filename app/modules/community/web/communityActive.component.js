import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import styled from 'styled-components/primitives';
import { colors, layout } from 'app/styles/globalStyles';
import ULink from 'modules/navigation/link.component';
import ULink2 from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/web/UAvatar.component';

const StyledAvatar = styled(UAvatar)`
  margin-right: 0.5em;
`;

const NavSection = styled.View`
  padding: 2em;
  border-bottom: ${layout.borderStyles(colors.borderColor)};
`;

const MemberContainer = styled.View`
  margin-bottom: 1em;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const TopicsContainer = styled.View`
  margin: 1em;
`;

const MemberCount = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: 1em;
`;

const StyledTopic = styled.Text`
  margin-left: 1em;
  /* font-weight: bold */
`;
// color: #717171;

const topicStyles = `
  font-weight: bold;
  color: red;
  a {
    &:hover: {
      background: purple;
      color: blue !important;
    }
  }
  &:hover: {
    background: purple;
    color: blue !important;
  }
`;

const StyledCommunityList = styled.View`
`;

class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
    children: PropTypes.object,
    getCommunityMembers: PropTypes.func,
  };

  componentDidMount() {
    this.props.getCommunityMembers(this.props.community.slug);
  }

  render() {
    const { community, children } = this.props;
    const topics = get(community, 'topics', []);
    const members = get(community, 'members', []);
    const totalMembers = members.length;
    const limitedMembers = members.slice(0, 12);
    return (
      <StyledCommunityList>
        <NavSection>
          {children}
          <TopicsContainer>
            {topics.map(topic => (
              <ULink2 key={topic} to={`/${community.slug}/new/${topic}`} styles={topicStyles}>
                <StyledTopic >#{topic}</StyledTopic>
              </ULink2>
            ))}
          </TopicsContainer>
        </NavSection>
        <NavSection>
          <MemberCount>{`${totalMembers} Members`}</MemberCount>
          <MemberContainer>
            {limitedMembers.map(member => (
              <StyledAvatar
                key={member._id}
                user={member.user}
                size={32}
                noName
              />
            ))}
          </MemberContainer>
        </NavSection>
      </StyledCommunityList>);
  }
}

export default CommunityActive;
