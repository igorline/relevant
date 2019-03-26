import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { joinCommunity } from 'community/community.actions';
import AvatarBox from 'modules/user/avatarbox.component';

import { View, BodyText, Header } from 'modules/styled/uni';

const CommunityMember = ({ user }) => (
  <View fdirection="row">
    <AvatarBox
      user={{ ...user.embeddedUser, relevance: user.reputation + 0.1 }}
      showRelevance
      condensedView={false}
    />
  </View>
);

CommunityMember.propTypes = {
  user: PropTypes.object
};

class CommunityMembers extends Component {
  static propTypes = {
    community: PropTypes.object
    // actions: PropTypes.object,
    // auth: PropTypes.object
  };

  render() {
    const { community } = this.props;
    const { communities, active, members, communityMembers } = community;
    const activeCommunity = communities[active];
    return (
      <View fdirection="column">
        <Header>Community Members</Header>
        <BodyText>{activeCommunity.memberCount} Total</BodyText>
        {communityMembers[active].map(memberId => {
          const user = members[memberId];
          return <CommunityMember user={user} key={user._id} />;
        })}
        <BodyText>Search bar</BodyText>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      joinCommunity
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CommunityMembers)
);
