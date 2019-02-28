import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import UAvatar from 'modules/user/UAvatar.component';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import ULink from 'modules/navigation/ULink.component';
import * as navigationActions from 'modules/navigation/navigation.actions';
import ReactTooltip from 'react-tooltip';

import { sizing, colors } from 'app/styles';
import styled from 'styled-components/primitives';
import { Header, View, SecondaryText, CTALink, Text } from 'modules/styled/uni';
import { computeUserPayout } from 'app/utils/rewards';

const WalletInfo = styled.View`
  display: flex;
  flex-direction: column;
  padding-left: ${sizing(2)};
  flex-shrink: 1;
`;

export class NavProfile extends Component {
  static propTypes = {
    user: PropTypes.object,
    earnings: PropTypes.object,
    mobile: PropTypes.bool,
    actions: PropTypes.object
  };

  componentDidMount() {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
  }

  render() {
    const { user, earnings, mobile, actions } = this.props;
    if (!user) return null;

    // TODO optimize this so its not on every render?
    let pendingPayouts = 0;
    earnings.pending.forEach(id => {
      const earning = earnings.entities[id];
      pendingPayouts += computeUserPayout(earning);
    });

    const p = mobile ? 2 : 4;
    const hideGetTokens = user.twitterId && user.confirmed;

    return (
      <View bb flex={1}>
        <View p={p} pb={p + 1}>
          <View fdirection={'row'} justify="space-between" align="center">
            <Header>{user.name}</Header>
            <ULink hu to="/user/wallet" onPress={() => actions.goToTab('wallet')}>
              <CTALink c={colors.blue}>My Wallet</CTALink>
            </ULink>
          </View>

          <View fdirection={'row'} align={'center'} mt={4}>
            <UAvatar
              user={user}
              size={8}
              noName
              goToProfile={() => actions.goToTab('myProfile')}
            />
            <WalletInfo>
              <View fdirection={'row'}>
                <ULink to="/user/wallet" onPress={() => actions.push('statsView')}>
                  <RStat
                    user={user}
                    align="center"
                    data-for="mainTooltip"
                    data-tip={JSON.stringify({
                      type: 'TEXT',
                      props: {
                        text:
                          'Earn Reputation by posting comments.\nThe higher your score, the more weight your votes have.'
                      }
                    })}
                  />
                </ULink>
                <ULink to="/user/wallet" onPress={() => actions.goToTab('wallet')}>
                  <CoinStat
                    user={user}
                    isOwner={true}
                    align="center"
                    data-for="mainTooltip"
                    data-tip={JSON.stringify({
                      type: 'TEXT',
                      props: {
                        text:
                          'Get coins by upvoting quality links.\nThe higher your Reputation the more coins you earn.'
                      }
                    })}
                  />
                </ULink>
              </View>
              <View fdirection={'row'} align={'baseline'} color={colors.grey} mt={2}>
                <SecondaryText fs={1.5}>Pending Rewards: </SecondaryText>
                <CoinStat
                  size={1.5}
                  mr={1.5}
                  fs={1.5}
                  secondary
                  c={colors.black}
                  amount={pendingPayouts}
                  align={'baseline'}
                  data-for="mainTooltip"
                  data-tip={JSON.stringify({
                    type: 'TEXT',
                    props: {
                      text:
                        'These are your projected earnings for upvoting quality posts.\nRewards are paid out 3 days after a link is posted.'
                    }
                  })}
                />
              </View>
            </WalletInfo>
          </View>

          <View fdirection={'row'} align={'baseline'} mt={3}>
            {hideGetTokens ? null : (
              <ULink
                to="/user/wallet"
                c={colors.blue}
                hu
                onPress={e => {
                  e.preventDefault();
                  actions.showModal('getTokens');
                }}
                onClick={e => {
                  e.preventDefault();
                  actions.showModal('getTokens');
                }}
              >
                <CTALink c={colors.blue}>Get Tokens</CTALink>
              </ULink>
            )}
            {hideGetTokens ? null : <Text> &nbsp;&nbsp; </Text>}
            <ULink
              to="/user/wallet"
              ml={1}
              c={colors.blue}
              hu
              onPress={e => {
                e.preventDefault();
                actions.showModal('invite');
              }}
              onClick={e => {
                e.preventDefault();
                actions.showModal('invite');
              }}
            >
              <CTALink c={colors.blue}>Invite Friends</CTALink>
            </ULink>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  earnings: state.earnings
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...navigationActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavProfile);
