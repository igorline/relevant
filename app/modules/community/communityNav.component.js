import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { colors } from 'app/styles';
import * as communityActions from 'modules/community/community.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { setCommunity } from 'modules/auth/auth.actions';
import { css } from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import CommunityActive from 'modules/community/communityActive.component';
import CommunityListItem from 'modules/community/communityListItem.component';
import get from 'lodash.get';
import { View, BodyText } from 'modules/styled/uni';

// TODO: change to work like in the communityActive component
const linkStyle = css`
  display: flex;
  align-items: center;
  color: ${colors.black};
  &:hover {
    text-decoration: underline;
    text-decoration-color: ${colors.black};
    background: ${colors.white};
  }
`;

export class Community extends Component {
  static propTypes = {
    actions: PropTypes.object,
    community: PropTypes.object,
    view: PropTypes.object,
    auth: PropTypes.object,
    screenSize: PropTypes.number
  };

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  renderCommunityLink(community) {
    const { actions } = this.props;
    return (
      <ULink
        styles={linkStyle}
        key={community._id}
        to={'/' + community.slug + '/new'}
        onPress={() => {
          actions.goToTab('discover');
          requestAnimationFrame(() => {
            actions.setCommunity(community.slug);
          });
        }}
        onClick={() => {
          actions.setCommunity(community.slug);
        }}
      >
        <CommunityListItem community={community} p={['1 4', '1 2']} />
      </ULink>
    );
  }

  renderOtherCommunities() {
    const { communities, list } = this.props.community;
    return list.map(id => {
      const community = communities[id];
      if (!community) {
        return null;
      }
      const isActive = this.props.community.active === community.slug;
      if (isActive) return null;
      return this.renderCommunityLink(community);
    });
  }

  render() {
    const { community, actions, view, auth, screenSize } = this.props;
    const { communityMembers, members, communities } = community;
    const activeCommunity = communities[community.active];
    const activeMembers = get(communityMembers, community.active, []).map(
      id => members[id]
    );
    return (
      <View flex={1}>
        <View bb>
          {activeCommunity && (
            <CommunityActive
              key={activeCommunity._id}
              community={activeCommunity}
              members={activeMembers}
              actions={actions}
              screenSize={screenSize}
              getCommunityMembers={get(actions, 'getCommunityMembers', null)}
              view={view}
              auth={auth}
            >
              {this.renderCommunityLink(activeCommunity)}
            </CommunityActive>
          )}
          <View m={'2 0'}>{this.renderOtherCommunities()}</View>
        </View>
        <BodyText m={[4, 2]}>
          We'll be adding more communities in the coming weeks!{'\n\n'}
        </BodyText>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  community: state.community,
  auth: state.auth,
  view: state.view,
  screenSize: state.navigation.screenSize
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...communityActions,
      ...navigationActions,
      setCommunity
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Community);
