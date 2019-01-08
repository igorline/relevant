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

// const StyledULink = styled(ULink)`
//   display: flex;
//   align-items: center;
//   color: ${colors.black};
// `;

const StyledView = styled.View`
  margin-bottom: 1em;
`;

const MemberContainer = styled.View`
  margin-bottom: 1em;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const StyledText = styled.Text`
  display: inline;
`;

const StyledImage = styled.Image`
  width: 30;
  height: 30;
  border-radius: 50;
  display: inline-block;
`;

const StyledCommunityList = styled.View`
  margin: 2em;
`;

const linkStyles = {
  color: 'black',
};

const avatarStyles = {
  width: '30px',
  display: 'inline-block',
};


class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
    getCommunityMembers: PropTypes.func,
  };

  componentDidMount() {
    this.props.getCommunityMembers(this.props.community.slug);
  }

  render() {
    const { community } = this.props;
    const topics = get(community, 'topics', []);
    const members = get(community, 'members', []);
    const totalMembers = members.length;
    const limitedMembers = members.slice(0, 12);
    return (
      <StyledCommunityList>
        {topics.map(topic => (
          <ULink key={topic} to={`/${community.slug}/new/${topic}`} style={linkStyles}>
            <StyledText >#{topic}</StyledText>
          </ULink>
        ))}
        <StyledText>{
          `${totalMembers} Members`
        }</StyledText>
        <MemberContainer>
          {limitedMembers.map(member => (
            <ULink key={member._id} to={`/user/profile/${member.user.handle}`} style={avatarStyles}>
              <StyledImage source={{ uri: member.user.image }} />
            </ULink>
          ))}
        </MemberContainer>

      </StyledCommunityList>);
  }
};

export default CommunityActive;
