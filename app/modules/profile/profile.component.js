import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import UAvatar from 'modules/user/UAvatar.component';
import { colors, sizing, mixins, fonts } from 'app/styles';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import { View, Header, AltLink, BodyText, Text } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import { css } from 'styled-components/primitives';
import Percent from 'modules/stats/percent.component';

const SettingsImage = require('app/public/img/settings.svg');
const InviteImage = require('app/public/img/invite.svg');

const linkStyle = css`
  ${fonts.altLink}
  ${mixins.color}
`;

class Profile extends Component {
  static propTypes = {
    actions: PropTypes.object,
    isOwner: PropTypes.bool,
    user: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object,
    bio: PropTypes.func
  };

  componentDidMount() {
    this.checkRouteForModal(true);
  }

  checkRouteForModal(firstRun) {
    const { user, actions, location, history } = this.props;
    const settingsUrl = `/user/profile/${user.handle}/settings`;
    const profileUrl = `/user/profile/${user.handle}`;
    if (settingsUrl === location.pathname) {
      const searchString = `?redirect=${profileUrl}`;
      if (firstRun && location.search !== searchString) {
        history.push({ search: searchString });
      }
      actions.showModal('settings');
    } else {
      actions.hideModal();
    }
  }

  render() {
    const { user, isOwner, actions, location, bio } = this.props;
    if (!user) {
      return <div className="profileContainer">User not found!</div>;
    }

    // TODO upload image button
    // let uploadImg;
    // if (this.props.auth.user && user._id === this.props.auth.user._id) {
    //   uploadImg = <button className={'uploadImg edit'}>Update Profile Image</button>;
    // }

    return (
      <View
        m={[4, 2]}
        display="flex"
        fdirection="row"
        align="flex-start"
        justify="flex-start"
      >
        <UAvatar user={user} size={9} />
        <View ml={sizing(2)} grow={1} shrink={1} wrap={1}>
          <View
            fdirection="row"
            display="flex"
            justify="space-between"
            align="baseline"
            wrap={1}
          >
            <View display="flex" fdirection="row" align="baseline" shrink={1} wrap={1}>
              <Header mr={sizing(2)}>{user.name}</Header>
              <RStat size={1.75} user={user} mr={2} align="baseline" />
              <Percent size={1.75} user={user} align="baseline" />
              <CoinStat size={1.75} user={user} isOwner={isOwner} align="baseline" />
            </View>
            {isOwner ? (
              <ULink
                onClick={() => {
                  actions.logoutAction(user);
                }}
                onPress={() => {
                  actions.logoutAction(user);
                }}
                color={colors.blue}
                to="#"
              >
                Logout
              </ULink>
            ) : (
              <View />
            )}
          </View>
          {bio ? (
            <View mt={[2, 2]}>
              <BodyText>{bio}</BodyText>
            </View>
          ) : null}
          {isOwner ? (
            <View fdirection="row" align="center" mt={2}>
              <AltLink mr={sizing(0.5)}>
                <ULink
                  c={colors.black}
                  to={`${location.pathname}/settings?redirect=${location.pathname}`}
                  hc={colors.secondaryText}
                  styles={linkStyle}
                >
                  <Text fdirection="row" align="center">
                    <View mr={sizing(0.5)}>
                      <SettingsImage h={sizing(2)} w={sizing(2)} bg={colors.grey} />
                    </View>
                    Settings
                  </Text>
                </ULink>
              </AltLink>

              <AltLink ml={sizing(0.5)} mr={sizing(0.5)}>
                <ULink
                  c={colors.black}
                  to="/invites"
                  hc={colors.secondaryText}
                  styles={linkStyle}
                  onPress={e => {
                    e.preventDefault();
                    actions.showModal('invite');
                  }}
                  onClick={e => {
                    e.preventDefault();
                    actions.showModal('invite');
                  }}
                >
                  <Text fdirection="row" align="center" ml={sizing(1)}>
                    <View mr={sizing(0.5)}>
                      <InviteImage h={sizing(2)} w={sizing(2)} bg={colors.grey} />
                    </View>
                    Invite Friend
                  </Text>
                </ULink>
              </AltLink>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

export default withRouter(Profile);
