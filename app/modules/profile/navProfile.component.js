import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import UAvatar from 'modules/user/UAvatar.component';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import { withRouter } from 'react-router-dom';
import ULink from 'modules/navigation/ULink.component';
import { sizing, colors, fonts, mixins } from 'app/styles';
import styled from 'styled-components/primitives';

const Header = styled.Text`
  ${fonts.header}
  ${mixins.margin}
`;

const View = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${sizing(3)};
`;

const Text = styled.Text`
  display: flex;
  flex: 1;
`;

const WalletInfo = styled.View`
  display: flex;
  flex-direction: column;
  padding-left: ${sizing(2)};
  flex-shrink: 1;
`;

const ProfileContainer = styled.View`
  padding: ${sizing(4)};
  padding-bottom: ${sizing(5)};
`;

const ProfileDetailsContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const StyledAvatar = styled(UAvatar)``;

const PendingPayouts = styled.Text`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  color: ${colors.grey};
  font-size: ${sizing(1.5)};
  line-height: ${sizing(1.5)};
  margin-top: ${sizing(2)};
`;

const linkStyles = `
  display: flex;
  align-items: center;
  font-size: ${sizing(1.5)}
  color: ${colors.blue};
`;

const walletLinkStyles = `
  ${linkStyles}
  color: ${colors.black};
`;

export class NavProfile extends Component {
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
      const r = earnings.entities[id];
      if (r && r.estimatedPostPayout && r.totalPostShares) {
        // TODO include actual rewards here based on % share
        pendingPayouts += (r.estimatedPostPayout * r.shares) / r.totalPostShares;
      }
    });

    return (
      <ProfileContainer>
        <View>
          <Header mb={0}>{user.name}</Header>
          <ULink to="/user/wallet" styles={linkStyles}>
            {' '}
            My Wallet
          </ULink>
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
              <CoinStat size={1.5} mr={1.5} inheritfont={1} amount={pendingPayouts} />
            </PendingPayouts>
          </WalletInfo>
        </ProfileDetailsContainer>
      </ProfileContainer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  earnings: state.earnings
});

export default withRouter(
  connect(
    mapStateToProps,
    {}
  )(NavProfile)
);
