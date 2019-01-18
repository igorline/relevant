import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { connect } from 'react-redux';
import Avatar from 'modules/user/web/avatar.component';
import { numbers } from 'app/utils';
import styled from 'styled-components';
import { layout, colors } from 'app/styles/globalStyles';

if (process.env.BROWSER === true) {
  require('./profile.css');
}

const Logout = styled.a`
  display: inline-block;
  width: 100%;
  text-align: right;
  padding-right: 2em;
  ${layout.linkStyle}
`;

export class Profile extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object,
    match: PropTypes.object
  };

  state = { tokens: null };

  static getDerivedStateFromProps(props) {
    const { auth, wallet, match } = props;
    const user = props.user.users[match.params.id];
    if (!user) return null;
    let tokens = user.balance;
    if (user.tokenBalance) tokens += user.tokenBalance;
    const owner = auth.user;
    if (
      owner &&
      owner._id === user._id &&
      user.ethAddress &&
      user.ethAddress[0] &&
      wallet.connectedBalance
    ) {
      tokens = wallet.connectedBalance + user.balance;
    }
    return { tokens };
  }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const { id } = this.props.match.params;
    const user = this.props.user.users[id];
    const { actions, auth } = this.props;
    const isOwnProfile = get(user, 'id') === get(auth, 'user.id');
    if (!user) {
      return <div className="profileContainer">User not found!</div>;
    }

    // TODO upload image button
    // let uploadImg;
    // if (this.props.auth.user && user._id === this.props.auth.user._id) {
    //   uploadImg = <button className={'uploadImg edit'}>Update Profile Image</button>;
    // }

    return (
      <div className="profileContainer">

        <div className="profileHero">
          { isOwnProfile ?
            (<Logout
              onClick={() => { actions.logoutAction(user); }}
              color={colors.blue}> Logout
            </Logout>)
            : null
          }
          <Avatar user={user} />
          <div className="name">{user.name}</div>
          <div className="relevance">
            <img src="/img/r-emoji.png" alt="Relevance" className="r" />
            {Math.round(user.relevance ? user.relevance.pagerank || 0 : 0)}
            <img src="/img/relevantcoin.png" alt="Coins" className="coin" />
            {fixed(this.state.tokens) || 0}
          </div>
          <div className="subscribers">
            {'Subscribers: '}
            <b>{user.followers}</b>
            {' • '}
            {'Subscribed to: '}
            <b>{user.following}</b>
          </div>
          <div className="tags">
            {'Expertise: '}
            {(user.topTags || []).map((tag, i) => (
              <a className="tag" key={i}>
                {'#' + tag.tag + ' '}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  auth: state.auth
});


export default connect(
  mapStateToProps,
  {},
)(Profile);
