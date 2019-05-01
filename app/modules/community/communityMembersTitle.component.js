import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { joinCommunity } from 'community/community.actions';

import { View, BodyText, Header } from 'modules/styled/uni';

class CommunityMembersTitle extends Component {
  static propTypes = {
    community: PropTypes.object
  };

  render() {
    const { community } = this.props;
    const { communities, active } = community;
    const activeCommunity = communities[active];
    return (
      <View fdirection="row" align="baseline">
        <Header inline={1}>Community Members</Header>
        <BodyText ml={2} inline={1}>
          {activeCommunity.memberCount} Total
        </BodyText>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  community: state.community
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      joinCommunity
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunityMembersTitle);
