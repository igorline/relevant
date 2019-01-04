import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { bindActionCreators } from 'redux';
import get from 'lodash.get';
import { connect } from 'react-redux';
import Avatar from 'modules/user/web/avatar.component';
import { numbers } from 'app/utils';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

const StyledIconImg = styled.img`
  width: 30px;
  height: 30px;
  margin: 0 1em;
`;

const StyledAvatar = styled(Avatar)`
  width: 64px;
  margin: 0 1em;
`;

const ProfileContainer = styled.div`
  margin: 2em;
`;

const ProfileDetailsContainer = styled.div`
  display: flex;
  align-items: center;
`;


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
      return <div className="profileContainer">User not found!</div>;
    }

    return (
      <ProfileContainer>
        <h3>{user.name}</h3>
        <p>PENDING PAYOUTS</p>
        <ProfileDetailsContainer>
          <StyledAvatar user={user} />
          <StyledIconImg src="/img/r-emoji.png" alt="Relevance" />
          <span>{Math.round(user.relevance ? user.relevance.pagerank || 0 : 0)}</span>
          <StyledIconImg src="/img/relevantcoin.png" alt="Coins" />
          <span>{fixed(this.state.tokens) || 0}</span>
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
