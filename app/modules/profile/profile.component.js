import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UAvatar from 'modules/user/UAvatar.component';
import { layout, colors, sizing, mixins, fonts } from 'app/styles';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import { View, Header, AltLink, Image, Text } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import styled, { css } from 'styled-components/primitives';

const SettingsImage = require('app/public/img/settings.svg');
const InviteImage = require('app/public/img/invite.svg');

// const Image = styled.Image`
// `;

const LogoutContainer = styled.Touchable`
`;

const LogoutText = styled.Text`
  text-align: right;
  ${layout.linkStyle}
  position: absolute;
  top: ${sizing(0)};
  right: ${sizing(0)};
  color: ${colors.blue};
`;

const linkStyle = css`
  ${fonts.altLink}
  ${mixins.color}
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
      <View m={sizing(4)} display="flex" direction="row" align="flex-start" justifyContent="space-between" >
        { isOwner ?
          (<LogoutContainer
            onClick={() => { actions.logoutAction(user); }}
            color={colors.blue}>
            <LogoutText>Logout</LogoutText>
          </LogoutContainer>)
          : null
        }
        <UAvatar user={user} size={9}/>
        <View ml={sizing(2)}>
          <View direction="row" display="flex" alignItems={'center'}>
            <Header mr={sizing(2)}>{user.name}</Header>
            <RStat size={2} user={user} mr={2} />
            <CoinStat size={2} user={user} isOwner={isOwner} />
          </View>
          <View direction="row" alignItems="center" >
            <AltLink ml={sizing(0.5)} mr={sizing(0.5)}>
              <ULink c={colors.black} to="/settings" hc={colors.secondaryText} styles={linkStyle}>
                <Text direction="row" alignItems="center">
                  <SettingsImage
                    h={sizing(2)}
                    w={sizing(2)}
                    bg={colors.grey}
                  />
                  Settings
                </Text>
              </ULink>
            </AltLink>

            <AltLink ml={sizing(0.5)} mr={sizing(0.5)}>
              <ULink c={colors.black} to="/invites" hc={colors.secondaryText} styles={linkStyle}>
                <Text direction="row" alignItems="center" ml={sizing(1)}>
                  <InviteImage
                    h={sizing(2)}
                    w={sizing(2)}
                    bg={colors.grey}
                  />
                Invite Friend
                </Text>
              </ULink>
            </AltLink>
          </View>
        </View>
      </View>
    );
  }
}


// <View>{user.name}</View>
// <View>
//   <RStat user={user} />
//   <CoinStat user={user} isOwner={isOwner} />
// </View>
