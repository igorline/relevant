import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import UAvatar from 'modules/user/UAvatar.component';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
// import { withRouter } from 'react-router-dom';
import ULink from 'modules/navigation/ULink.component';
import { sizing, colors } from 'app/styles';
import styled from 'styled-components/primitives';
import { Header, View, LinkFont, SecondaryText } from 'modules/styled/uni';

const WalletInfo = styled.View`
  display: flex;
  flex-direction: column;
  padding-left: ${sizing(2)};
  flex-shrink: 1;
`;

export class NavProfile extends Component {
  static propTypes = {
    user: PropTypes.object,
    earnings: PropTypes.object,
    mobile: PropTypes.bool
  };

  render() {
    const { user, earnings, mobile } = this.props;
    if (!user) return null;

    // TODO optimize this so its not on every render?
    let pendingPayouts = 0;
    earnings.pending.forEach(id => {
      const r = earnings.entities[id];
      if (r && r.estimatedPostPayout && r.totalPostShares) {
        // TODO include actual rewards here based on % share
        pendingPayouts += (r.estimatedPostPayout * r.shares) / r.totalPostShares;
      }
    });

    const p = mobile ? 2 : 4;

    return (
      <View p={p} pb={p + 1}>
        <View fdirection={'row'} align={'baseline'} justify={'space-between'}>
          <Header mb={3}>{user.name}</Header>
          <ULink to="/user/wallet">
            <LinkFont c={colors.blue}> My Wallet</LinkFont>
          </ULink>
        </View>

        <View fdirection={'row'} align={'center'}>
          <UAvatar user={user} size={8} noName />
          <WalletInfo>
            <ULink to="/user/wallet">
              <View fdirection={'row'}>
                <RStat user={user} align="center" />
                <CoinStat user={user} isOwner={true} align="center" />
              </View>
            </ULink>
            <View fdirection={'row'} align={'baseline'} color={colors.grey} mt={2}>
              <SecondaryText fs={1.5}>Pending Rewards: </SecondaryText>
              <CoinStat
                size={1.5}
                mr={1.5}
                fs={1.5}
                secondary
                amount={pendingPayouts}
                align={'baseline'}
              />
            </View>
          </WalletInfo>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  earnings: state.earnings
});

export default connect(
  mapStateToProps,
  {}
)(NavProfile);
