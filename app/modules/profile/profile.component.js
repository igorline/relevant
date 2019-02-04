import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UAvatar from 'modules/user/UAvatar.component';
import { colors, sizing, mixins, fonts } from 'app/styles';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import { View, Header, AltLink, SecondaryText, Text } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import { css } from 'styled-components/primitives';
import Percent from 'modules/stats/percent.component';

const SettingsImage = require('app/public/img/settings.svg');
const InviteImage = require('app/public/img/invite.svg');

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
      <View m={sizing(4)} display="flex" direction="row" align="flex-start" justify="space-between" >
        <UAvatar user={user} size={9}/>
        <View ml={sizing(2)} grow={1}>
          <View direction="row" display="flex" align={'center'} justify="space-between">
            <View direction="row" display="flex" >
              <Header mr={sizing(2)}>{user.name}</Header>
              <RStat size={2} user={user} mr={2} />
              <Text><Percent user={user} /></Text>
              <CoinStat size={2} user={user} isOwner={isOwner} />
            </View>
            { isOwner ?
              (<View align={'center'}>
                <ULink
                  onClick={() => { actions.logoutAction(user); }}
                  onPress={() => { actions.logoutAction(user); }}
                  color={colors.blue}
                  to="#"
                >
                  Logout
                </ULink>
              </View>
              )
              : <View />
            }
          </View>
          { user.bio ?
            <View><SecondaryText>{user.bio}</SecondaryText></View>
            : null
          }
          <View direction="row" align="center" >
            <AltLink ml={sizing(0.5)} mr={sizing(0.5)}>
              <ULink c={colors.black} to="/settings" hc={colors.secondaryText} styles={linkStyle}>
                <Text direction="row" align="center">
                  <View mr={sizing(0.5)}>
                    <SettingsImage
                      h={sizing(2)}
                      w={sizing(2)}
                      bg={colors.grey}
                    />
                  </View>
                  Settings
                </Text>
              </ULink>
            </AltLink>

            <AltLink ml={sizing(0.5)} mr={sizing(0.5)}>
              <ULink c={colors.black} to="/invites" hc={colors.secondaryText} styles={linkStyle}>
                <Text direction="row" align="center" ml={sizing(1)}>
                  <View mr={sizing(0.5)}>
                    <InviteImage
                      h={sizing(2)}
                      w={sizing(2)}
                      bg={colors.grey}
                    />
                  </View>
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
