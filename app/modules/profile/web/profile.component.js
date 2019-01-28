import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Avatar from 'modules/user/web/avatar.component';
import styled from 'styled-components';
import { layout, colors, sizing } from 'app/styles';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';

if (process.env.BROWSER === true) {
  require('./profile.css');
}

const Logout = styled.a`
  display: inline-block;
  width: 100%;
  text-align: right;
  padding-right: ${sizing.byUnit(4)};
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
            <RStat user={user} />
            <CoinStat user={user} isOwner={isOwner} />
          </div>
        </div>
      </div>
    );
  }
}
