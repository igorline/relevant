import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { colors } from 'app/styles/globalStyles';
import * as communityActions from 'modules/community/community.actions';
import { setCommunity } from 'modules/auth/auth.actions';
import styled from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import CommunityActive from 'modules/community/web/communityActive.component';
import get from 'lodash.get';

const linkStyle = `
  display: flex;
  align-items: center;
  color: ${colors.black};
`;

const StyledView = styled.View`
  margin-bottom: 1em;
  background: ${props => props.active ? 'hsl(0, 0%, 92%)' : 'transparent'};
`;

const StyledImage = styled.Image`
  width: 30;
  height: 30;
  margin-right: 1em;
`;

const StyledCommunityList = styled.View`
`;

const CommunityLink = ({ community, onClick }) => {
  return (
    <ULink
      styles={linkStyle}
      key={community._id}
      to={'/' + community.slug + '/new'}
      onPress={() => { onClick(community.slug); }}
      onClick={() => { onClick(community.slug); }}
    >
      <StyledImage source={{ uri: community.image }}/>
      {community.name}
    </ULink>
  );
};

CommunityLink.propTypes = {
  community: PropTypes.object,
  setCommunity: PropTypes.func,
};


class Community extends Component {
  static propTypes = {
    actions: PropTypes.object,
    community: PropTypes.object,
  };

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  renderCommunities() {
    const { actions } = this.props;
    const { communities, list } = this.props.community;
    return list.map(id => {
      const community = communities[id];
      const isActive = this.props.community.active === community.slug;
      return (
        <StyledView key={community._id} active={isActive} >
          {isActive ?
            <CommunityActive
              community={community}
              getCommunityMembers={get(actions, 'getCommunityMembers', null)}
            >
              <CommunityLink community={community} onClick={actions.setCommunity} />
            </CommunityActive>
            : <CommunityLink community={community} onClick={actions.setCommunity} />}
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
      ...communityActions,
      setCommunity,
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
