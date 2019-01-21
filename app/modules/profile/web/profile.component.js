import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from 'modules/user/web/avatar.component';
import CoinStat from 'modules/stats/coinStat.component';
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

export default class Profile extends Component {
  static propTypes = {
    actions: PropTypes.object,
    isOwner: PropTypes.bool,
    user: PropTypes.object,
  };

  render() {
    const { user, isOwner, actions } = this.props;
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
          { isOwner ?
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
            <CoinStat user={user} isOwner={isOwner} />
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
