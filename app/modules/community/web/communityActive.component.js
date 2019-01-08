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
`;

const StyledView = styled.View`
  margin-bottom: 1em;
`;

const StyledText = styled.Text`
  display: inline;
`;

const StyledImage = styled.Image`
  width: 30;
  height: 30;
  display: inline-block;
  margin-right: 1em;
`;

const StyledCommunityList = styled.View`
  margin: 2em;
`;


class CommunityActive extends Component {
  static propTypes = {
    community: PropTypes.object,
  };

  componentDidMount() {
  }

  render() {
    const { community } = this.props;
    const topics = get(community, 'topics', []);
    return (
      <StyledCommunityList>
        {topics.map(topic => (
          <StyledULink to={`/${community.slug}/new/${topic}`}>
            <StyledText>#{topic}</StyledText>
          </StyledULink>
        ))}
      </StyledCommunityList>);
  }
}

export default CommunityActive;
