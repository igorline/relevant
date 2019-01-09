import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import Avatar from 'modules/user/web/avatar.component';
import { numbers } from 'app/utils';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import ULink from 'modules/navigation/link.component';

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

const StyledAvatar = styled(Avatar)`
  background: red;
  margin: 0 1em;
`;


const PendingPayouts = styled.div`
  font-weight: normal;
  color: hsl(0, 0%, 55%);
  font-size: 14px;
`;

const linkStyles = {
  display: 'flex',
  alignItems: 'center',
  color: 'black',
};


class NavProfile extends Component {
  static propTypes = {
    user: PropTypes.object,
    handle: PropTypes.string,
  };

  state = { tokens: null };

  static getDerivedStateFromProps(props) {
    const { auth, wallet, match } = props;
    const user = props.user.users[match.params.id];
    if (!user) return null;
    let tokens = user.balance + user.tokenBalance;
    const owner = auth.user;
    if (
      owner &&
      owner._id === user._id &&
      user.ethAddress[0] &&
      wallet.connectedBalance
    ) {
      tokens = wallet.connectedBalance + user.balance;
    }
    return { tokens };
  }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const id = this.props.handle;
    const user = this.props.user.users[id];
    if (!user) {
      return null;
    }

    return (
      <ProfileContainer>
        <div>{user.name}</div>
        <PendingPayouts>PENDING PAYOUTS</PendingPayouts>
        <ProfileDetailsContainer>
          <StyledAvatar user={user} size={64} />
          <ULink to="/user/wallet" style={linkStyles}>
            <StyledIconImg src="/img/r-emoji.png" alt="Relevance" />
            <span>{Math.round(user.relevance ? user.relevance.pagerank || 0 : 0)}</span>
            <StyledIconImg src="/img/relevantcoin.png" alt="Coins" />
            <span>{fixed(this.state.tokens) || 0}</span>
          </ULink>
        </ProfileDetailsContainer>
      </ProfileContainer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  handle: get(state.auth, 'user.handle'),
});

export default withRouter(connect(
  mapStateToProps,
  {}
)(NavProfile));
