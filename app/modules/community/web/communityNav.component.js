import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as communityActions from 'modules/community/community.actions';
import styled, { css } from 'styled-components/primitives';
import { colors } from 'app/styles/globalStyles';
import ULink from 'modules/navigation/link.component';
import CommunityActive from 'modules/community/web/communityActive.component';

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


class Community extends Component {
  static propTypes = {
    actions: PropTypes.object,
    community: PropTypes.object,
    auth: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  renderCommunities() {
    const { communities, list } = this.props.community;
    return list.map(id => {
      const community = communities[id];
      const isActive = this.props.community.active === community.slug;
      // const active = currentCommunity === community.slug;
      // const className = active ? 'active' : null;
      return (
        <StyledView key={community._id}>
          <StyledULink
            key={community._id}
            to={'/' + community.slug + '/new'}
            onPress={() => {}}
          >
            <StyledImage source={{ uri: community.image }}/>
            <StyledText>{community.name}</StyledText>
          </StyledULink>
          {isActive ? <CommunityActive community={community} /> : null}
        </StyledView>
      );
    });
  }


  render() {
    return (
      <StyledCommunityList>
        {this.renderCommunities()}
      </StyledCommunityList>);
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community,
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...communityActions
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Community)
);
