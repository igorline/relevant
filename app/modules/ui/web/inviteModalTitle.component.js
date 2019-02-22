import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { View, Header, NumericalValue } from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getInvites } from 'modules/admin/admin.actions';
import { MAX_AIRDROP } from 'server/config/globalConstants';

const InviteImage = require('app/public/img/invite.svg');

class InviteModalTitle extends Component {
  static propTypes = {
    inviteList: PropTypes.array,
    actions: PropTypes.object,
    user: PropTypes.user
  };
  componentDidMount() {
    if (!this.props.inviteList.length) {
      const skip = this.props.inviteList.length;
      this.props.actions.getInvites(skip, 100);
    }
  }
  submit = async () => {};
  render() {
    const { inviteList, user } = this.props;
    const invited = inviteList.length;
    return (
      <View
        display="flex"
        fdirection="row"
        justify="space-between"
        align="center"
        flex={1}
      >
        <Header>Invite Friends</Header>
        <View display="flex" fdirection="row" align="center">
          <CoinStat noNumber mr={0} size={2} align="center" />
          <NumericalValue mr={1}>{`$${
            user.referralTokens
          } Earned (max ${MAX_AIRDROP})`}</NumericalValue>
          <InviteImage />
          <NumericalValue ml={0.5}>
            {`${invited || 0} Friend${invited === 1 ? '' : 's'} Invited`}
          </NumericalValue>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  inviteList: get(state, 'admin.inviteList', {}) || {}
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      getInvites
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteModalTitle);
