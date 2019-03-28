import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { joinCommunity } from 'community/community.actions';
import AvatarBox from 'modules/user/avatarbox.component';

import { View, BodyText, SecondaryText } from 'modules/styled/uni';

const CommunityMember = ({ user }) => (
  <View fdirection="row" m={['1 0']}>
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
  };

  getTitle(role) {
    const TITLES = {
      admin: 'Adminstrators',
      user: 'Trusted Users'
    };
    return TITLES[role];
  }

  render() {
    const { community } = this.props;
    const { active, members, communityMembers } = community;
    const activeCommunityMembers = communityMembers[active];
    // const admins = activeCommunityMembers.filter(member => members[member].role === 'admin');
    // const others = activeCommunityMembers.filter(member => admins.indexOf(member) === -1);
    let role;
    return (
      <View fdirection="column">
        <BodyText>Search bar</BodyText>
        <View mt={2}>
          {activeCommunityMembers.map(memberId => {
            const user = members[memberId];
            const title = role === user.role ? null : this.getTitle(user.role);
            role = user.role;
            return (
              <React.Fragment key={user._id}>
                {title ? <SecondaryText m={'2 0'}>{title}</SecondaryText> : null}
                <CommunityMember user={user} key={user._id} />
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community
  // auth: state.auth
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
