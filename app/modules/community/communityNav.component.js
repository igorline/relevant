import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { colors, sizing, fonts } from 'app/styles';
import * as communityActions from 'modules/community/community.actions';
import { setCommunity } from 'modules/auth/auth.actions';
import styled, { css } from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import CommunityActive from 'modules/community/communityActive.component';
import get from 'lodash.get';

// TODO: change to work like in the communityActive component
const linkStyle = css`
  display: flex;
  align-items: center;
  color: ${colors.black};
  padding: ${sizing(1)} ${sizing(4)};
  &:hover {
    font-weight: bold;
    background: white;
    margin-right: 1px;
  }
`;

const CommunityContainer = styled.View`
  margin: ${sizing(3)} 0};
`;

const StyledImage = styled.Image`
  width: ${sizing(4)};
  height: ${sizing(4)};
  margin-right: ${sizing(1.5)};
  background: ${p => (p.image ? 'transparent' : colors.grey)};
`;

const CommunityLinkTab = styled.Text`
  ${fonts.fonts}
`;

const StyledCommunityList = styled.View``;

const CommunityLink = ({ community, onClick }) => (
  <CommunityLinkTab p={`${sizing(0)} ${sizing(0)}`}>
    <ULink
      styles={linkStyle}
      key={community._id}
      to={'/' + community.slug + '/new'}
      onPress={() => {
        onClick(community.slug);
      }}
      onClick={() => {
        onClick(community.slug);
      }}
    >
      <StyledImage image={community.image} source={{ uri: community.image }} />
      {community.name}
    </ULink>
  </CommunityLinkTab>
);

CommunityLink.propTypes = {
  community: PropTypes.object,
  onClick: PropTypes.func
};

export class Community extends Component {
  static propTypes = {
    actions: PropTypes.object,
    community: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  renderOtherCommunities() {
    const { actions } = this.props;
    const { communities, list } = this.props.community;
    return list.map(id => {
      const community = communities[id];
      const isActive = this.props.community.active === community.slug;
      if (isActive) return null;
      return (
        <CommunityLink
          key={community._id}
          community={community}
          onClick={actions.setCommunity}
        />
      );
    });
  }

  render() {
    const { community, actions } = this.props;
    const { communityMembers, members, communities } = community;
    const activeCommunity = communities[community.active];
    if (!activeCommunity) return null;
    const activeMembers = get(communityMembers, community.active, []).map(
      id => members[id]
    );
    return (
      <StyledCommunityList>
        {activeCommunity && (
          <CommunityActive
            key={activeCommunity._id}
            community={activeCommunity}
            members={activeMembers}
            getCommunityMembers={get(actions, 'getCommunityMembers', null)}
          >
            <CommunityLink community={activeCommunity} onClick={actions.setCommunity} />
          </CommunityActive>
        )}
        <CommunityContainer>{this.renderOtherCommunities()}</CommunityContainer>
      </StyledCommunityList>
    );
  }
}

const mapStateToProps = state => ({
  community: state.community,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...communityActions,
      setCommunity
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Community);
