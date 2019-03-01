import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createInvite, getInviteCount, getInvites } from 'modules/admin/admin.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as postActions from 'modules/post/post.actions';
import Share from 'react-native-share';
import InviteComponent from 'modules/invites/inviteModal.component';
import { View } from 'modules/styled/uni';
import InviteModalTitle from 'modules/invites/inviteModalTitle.component';

import { ScrollView } from 'react-native';

class Invites extends Component {
  static propTypes = {
    actions: PropTypes.object
  };

  componentWillMount() {
    this.props.actions.getInviteCount();
  }

  handleShare = shareOptions => {
    Share.open(shareOptions)
    // eslint-disable-next-line
      .then(res => {
      // console.log(res);
    })
    // eslint-disable-next-line
      .catch(err => {
      // err && console.log(err);
    });
  };

  render() {
    return (
      <ScrollView>
        <View m={2}>
          <InviteModalTitle />
          <InviteComponent mobile {...this.props} onShare={this.handleShare} />
        </View>
      </ScrollView>
    );
  }
}

function mapStateToProps(state) {
  return {
    users: state.user.users,
    auth: state.auth,
    invites: state.admin.invites,
    inviteList: state.admin.inviteList,
    community: state.community,
    count: state.admin.count
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
        ...navigationActions,
        createInvite,
        getInviteCount,
        getInvites
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Invites);
