import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as communityActions from 'modules/community/community.actions';
import styled, { css } from 'styled-components/primitives';

const StyledTouchable = styled.Touchable`
`;

const StyledView = styled.View`
  background: red;
`;

const StyledText = styled.Text`
  background: red;
`;

const StyledImage = styled.Image`
  width: 30,
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
        <StyledTouchable key={community._id}> href={'/' + community.slug + '/new'} to={'/' + community.slug + '/new'}>
          <StyledView>
            <StyledText>{community.name}</StyledText>
          </StyledView>
        </StyledTouchable>
      );
    });
  }

  // <StyledImage src={community.image} alt={`${community.name} logo`} />

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
