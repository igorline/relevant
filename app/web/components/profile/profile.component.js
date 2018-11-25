import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Avatar from '../common/avatar.component';
import { numbers } from '../../../utils';

if (process.env.BROWSER === true) {
  require('./profile.css');
}

class Profile extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    community: PropTypes.string,
    RelevantCoin: PropTypes.object,
    account: PropTypes.string,
  }

  state = { token: null };

  static getDerivedStateFromProps(nextProps) {
    let props = nextProps;
    const user = props.user.users[props.params.id];
    if (!user) return null;
    let tokens = user.balance + user.tokenBalance;
    let owner = props.auth.user;
    if (owner && owner._id === user._id && user.ethAddress[0] && nextProps.wallet.connectedBalance) {
      tokens = nextProps.wallet.connectedBalance + user.balance;
    }
    return { tokens };
  }

  // getTokens(props) {
  //   const user = props.user.users[props.params.id];
  //   if (!user) return;
  //   this.tokens = user.balance;
  //   let owner = props.auth.user;
  //   let account = props.account;
  //   if (account && props.community === 'crypto' && owner && owner._id === user._id) {
  //     this.tokens = BondedTokenUtils.getValue(props.RelevantCoin, 'balanceOf', account);
  //     // this.tokens = props.RelevantCoin.methods.balanceOf.cacheCall(account);
  //   }
  // }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const user = this.props.user.users[this.props.params.id];
    if (!user) {
      return (<div className="profileContainer">
        User not found!
      </div>);
    }

    let uploadImg;
    if (this.props.auth.user && user._id === this.props.auth.user._id) {
      uploadImg = <button className={'uploadImg edit'}>Update Profile Image</button>;
    }

    return (
      <div className="profileContainer">
        <div className="profileHero">
          <Avatar user={user} />
          <div className="name">{user.name}</div>
          <div className="relevance">
            <img src="/img/r-emoji.png" alt="Relevance" className="r" />
            {Math.round(user.relevance ? user.relevance.pagerank || 0 : 0)}
            <img src="/img/relevantcoin.png" alt="Coins" className="coin" />
            {fixed(this.state.tokens) || 0}
          </div>
          <div className="subscribers">
            {'Subscribers: '}<b>{user.followers}</b>
            {' • '}
            {'Subscribed to: '}<b>{user.following}</b>
          </div>
          <div className="tags">
            {'Expertise: '}
            {(user.topTags || []).map((tag, i) => (
              <a className="tag" key={i}>{'#' + tag.tag + ' '}</a>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  auth: state.auth,
  community: state.auth.community,
  RelevantCoin: state.contracts.RelevantCoin,
  account: state.accounts[0]
});

// const mapDispatchToProps = (dispatch) => ({
//   actions: bindActionCreators({
//     ...MessageActions
//   }, dispatch)
// });

export default connect(mapStateToProps, {})(Profile);
