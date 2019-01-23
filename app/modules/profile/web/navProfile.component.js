import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import UAvatar from 'modules/user/UAvatar.component';
import CoinStat from 'modules/stats/coinStat.component';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import ULink from 'modules/navigation/ULink.component';

const ProfileContainer = styled.div`
  margin: 2em;
  font-weight: bold;
  font-size: 18px;
`;

const ProfileDetailsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1em;
`;

const StyledIconImg = styled.img`
  width: 30px;
  height: 30px;
  margin: 0 0.3em 0 1em ;
`;

const StyledAvatar = styled(UAvatar)`
`;

const PendingPayouts = styled.div`
  font-weight: normal;
  color: hsl(0, 0%, 55%);
  font-size: 14px;
`;

const linkStyles = `
  display: flex;
  align-items: center;
  color: black;
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
      if (reward && reward.status === 'pending') {
        // TODO include actual rewards here based on % share
        pendingPayouts += reward.stakedTokens;
      }
    });

    return (
      <ProfileContainer>
        <div>{user.name}</div>
        <PendingPayouts>PENDING PAYOUTS: {pendingPayouts}</PendingPayouts>
        <ProfileDetailsContainer>
          <StyledAvatar user={user} size={64} noName />
          <ULink to="/user/wallet" styles={linkStyles}>
            <StyledIconImg src="/img/r-emoji.png" alt="Relevance" />
            <span>{Math.round(user.relevance ? user.relevance.pagerank || 0 : 0)}</span>
            <CoinStat user={user} isOwner={true} />
          </ULink>
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
