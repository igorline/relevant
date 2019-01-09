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

const StyledULink = styled(ULink)`
  display: flex;
  align-items: center;
  color: ${colors.black};
  margin-right: 0.5em;
`;

const NavSection = styled.View`
  padding: 2em;
  /* margin-bottom: 1em; */
  border-bottom: 1px solid black;
`;

const MemberContainer = styled.View`
  margin-bottom: 1em;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-weight: bold;
  color: black;
`;

const StyledText = styled.Text`
  display: inline;
`;

const MemberCount = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: 1em;
`;

const StyledTopic = styled.Text`
  margin-left: 1em;
`;

const MembersText = styled.Text`
  display: inline;
  border-bottom: solid black 1px;
  padding: 1em 0;
`;

const StyledImage = styled.Image`
  width: 30;
  height: 30;
  border-radius: 50;
  display: inline-block;
`;

const StyledCommunityList = styled.View`
`;

const linkStyles = {
  color: 'black',
};

const avatarStyles = {
  width: '30px',
  display: 'inline-block',
  marginRight: '0.5em',
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
              <ULink key={member._id} to={`/user/profile/${member.user.handle}`} style={avatarStyles}>
                <StyledImage source={{ uri: member.user.image }} />
              </ULink>
            ))}
          </MemberContainer>
        </NavSection>
      </StyledCommunityList>);
  }
}

export default CommunityActive;
