import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { View, Header } from 'modules/styled/uni';
import { connect } from 'react-redux';

class InviteModalTitle extends Component {
  static propTypes = {
    community: PropTypes.object
  };

  submit = async () => {};

  render() {
    const { community } = this.props;
    const activeCommunity = get(community, `communities.${community.active}.name`);
    return (
      <View
        display="flex"
        fdirection="row"
        justify="space-between"
        align="center"
        flex={1}
      >
        <Header shrink={1}>Invite Friends To {activeCommunity}</Header>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  community: state.community,
  inviteList: get(state, 'admin.inviteList', {}) || {}
});

const mapDispatchToProps = () => ({
  // actions: bindActionCreators(
  //   {
  //     // getInvites
  //   },
  //   dispatch
  // )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteModalTitle);
