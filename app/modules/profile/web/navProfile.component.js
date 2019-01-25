import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import UAvatar from 'modules/user/UAvatar.component';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import { withRouter } from 'react-router-dom';
import ULink from 'modules/navigation/ULink.component';
import { Header } from 'modules/styled';
import styled from 'styled-components/primitives';
import { sizing, colors } from 'app/styles/globalStyles';

const View = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: ${sizing.byUnit(4)};
`;

const Text = styled.Text`
  display: flex;
  flex: 1;
`;

const WalletInfo = styled.View`
  display: flex;
  flex-direction: column;
  padding-left: ${sizing.byUnit(2)};
  flex-shrink: 1;
`;

const StyledHeader = styled(Header)`
`;

const ProfileContainer = styled.View`
  padding: ${sizing.byUnit(4)};
`;

const ProfileDetailsContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  padding-top: ${sizing.byUnit(2)};
`;

const StyledAvatar = styled(UAvatar)`
`;

const PendingPayouts = styled.Text`
  display: flex;
  align-items: flex-start;
  font-weight: normal;
  justify-content: flex-start;
  color: hsl(0, 0%, 55%);
  font-size: 12px;
  line-height: 12px;
  margin-top: ${sizing.byUnit(2)};
`;


const linkStyles = `
  display: flex;
  align-items: center;
  color: ${colors.blue};
`;

const walletLinkStyles = `
  ${linkStyles}
  color: ${colors.black};
`;


class NavProfile extends Component {
  static propTypes = {
    user: PropTypes.object,
    earnings: PropTypes.object
  };

  render() {
    const { user, earnings } = this.props;
    if (!user) return null;

    // TODO optimize this so its not on every render?
    let pendingPayouts = 0;
    earnings.pending.forEach(id => {
      const reward = earnings.entities[id];
      if (reward && reward.stakedTokens) {
        // TODO include actual rewards here based on % share
        pendingPayouts += reward.stakedTokens;
      }
    });

    return (
      <ProfileContainer>
        <View>
          <StyledHeader>{user.name}</StyledHeader>
          <ULink to="/user/wallet" styles={linkStyles}> My Wallet</ULink>
        </View>

        <ProfileDetailsContainer>
          <StyledAvatar user={user} size={8} noName />
          <WalletInfo>
            <ULink to="/user/wallet" styles={walletLinkStyles}>
              <RStat user={user} />
              <CoinStat user={user} isOwner={true} />
            </ULink>
            <PendingPayouts>
              <Text>Pending Rewards: </Text>
              <CoinStat size={1.25} inherit amount={pendingPayouts} />
            </PendingPayouts>
          </WalletInfo>
        </ProfileDetailsContainer>
      </ProfileContainer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  earnings: state.earnings,
});

export default withRouter(connect(
  mapStateToProps,
  {}
)(NavProfile));
