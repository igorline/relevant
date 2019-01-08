import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as communityActions from 'modules/community/community.actions';
import styled, { css } from 'styled-components/primitives';
import ULink from 'modules/navigation/link.component';

const StyledULink = styled(ULink)`
  display: inline;
`;

const StyledView = styled.View`
  background: red;
  display: flex;
`;

const StyledText = styled.Text`
  background: red;
`;

const StyledImage = styled.Image`
  width: 30,
  height: 30,
  display: 'inline-block';
  padding: 3em;
  background: blue;
`;

const StyledCommunityList = styled.View`
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
    const currentCommunity = this.props.auth.community;
    return list.map(id => {
      const community = communities[id];
      // const active = currentCommunity === community.slug;
      // const className = active ? 'active' : null;
      return (
        <StyledView key={community._id}>
          <StyledULink
            key={community._id}
            to={'/' + community.slug + '/new'}
            to={'/' + community.slug + '/new'}
            onPress={() => {}}
          >
            <StyledImage source={{ uri: community.image }}/>
            <StyledText>{community.name}</StyledText>
          </StyledULink>
        </StyledView>
      );
    });
  }


  render() {
    return (
      <StyledView>
        {this.renderCommunities()}
      </StyledView>);
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
