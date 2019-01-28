import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import styled from 'styled-components/primitives';
import { StyleSheet } from 'react-primitives';
import { colors, sizing } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import UAvatar from 'modules/user/UAvatar.component';
import { LinkWithIcon, Header } from 'modules/styled';

const StyledHeader = styled(Header)`
  margin: ${sizing.byUnit(4)} ${sizing.byUnit(4)} ${sizing.byUnit(3)} ${sizing.byUnit(4)};
`;

const StyledAvatar = styled(UAvatar)`
  margin: 0 ${sizing.byUnit(1)} ${sizing.byUnit(1)} 0;
`;

const NavSection = styled.View`
  padding: 0 ${sizing.byUnit(4)} ${sizing.byUnit(4)};
  borderBottomColor: ${colors.lineColor};
  borderBottomWidth: ${StyleSheet.hairlineWidth};
`;

const MemberContainer = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const TopicsContainer = styled.View`
  margin: ${sizing.byUnit(1)} 0 ${sizing.byUnit(6)} ${sizing.byUnit(5.5)};
`;

// TODO: match to style guide once we get it e.g. h2, h3
const MemberCount = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: ${sizing.byUnit(2)};
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

const Wrapper = styled.View`
  background: white;
  margin-right: 1px;
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
      <Wrapper>
        <StyledHeader>Community</StyledHeader>
        {children}
        <NavSection>
          <TopicsContainer>
            {topics.map(topic => (
              <LinkWithIcon key={topic}>
                <ULink navLink to={`/${community.slug}/new/${topic}`} styles={topicStyles}>
                  #{topic}
                </ULink>
              </LinkWithIcon>
            ))}
          </TopicsContainer>
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
      </Wrapper>);
  }
}

export default CommunityActive;
