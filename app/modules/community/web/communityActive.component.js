import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as communityActions from 'modules/community/community.actions';
import styled, { css } from 'styled-components/primitives';
import { colors } from 'app/styles/globalStyles';
import ULink from 'modules/navigation/link.component';
import UAvatar from 'modules/user/web/UAvatar.component';

const StyledAvatar = styled(UAvatar)`
  margin-right: 0.5em;
`;

const StyledULink = styled(ULink)`
  display: flex;
  align-items: center;
  color: ${colors.black};
  margin-right: 0.5em;
`;

const NavSection = styled.View`
  padding: 2em;
  /* margin-bottom: 1em; */
  border: 1px solid black;
`;

const MemberContainer = styled.View`
  margin-bottom: 1em;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

// const StyledText = styled.Text`
//   display: inline;
// `;

const MemberCount = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: 1em;
`;

const StyledTopic = styled.Text`
  margin-left: 1em;
`;

const StyledCommunityList = styled.View`
`;

const linkStyles = {
  color: 'black',
};

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
          {topics.map(topic => (
            <ULink key={topic} to={`/${community.slug}/new/${topic}`} style={linkStyles}>
              <StyledTopic >#{topic}</StyledTopic>
            </ULink>
          ))}
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
