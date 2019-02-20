import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { View, Header, NumericalValue } from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getInvites } from 'modules/admin/admin.actions';

const InviteImage = require('app/public/img/invite.svg');

class InviteModalTitle extends Component {
  static propTypes = {
    inviteList: PropTypes.array,
    actions: PropTypes.object
  };
  componentDidMount() {
    if (!this.props.inviteList.length) {
      const skip = this.props.inviteList.length;
      this.props.actions.getInvites(skip, 100);
    }
  }
  submit = async () => {};
  render() {
    const { inviteList } = this.props;
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
          <NumericalValue mr={1}>{`$${0} Earned`}</NumericalValue>
          <InviteImage />
          <NumericalValue ml={0.5}>
            {`${inviteList.length || 0} Friends Invited`}
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
