import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { numbers } from 'app/utils';
import {
  View,
  BodyText,
  Header,
  SecondaryText,
  Touchable,
  Image,
  LinkFont
} from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { CASHOUT_LIMIT } from 'server/config/globalConstants';
// import Tooltip from 'modules/tooltip/tooltip.component';

export default class Balance extends Component {
  static propTypes = {
    user: PropTypes.object,
    contract: PropTypes.object,
    actions: PropTypes.object,
    wallet: PropTypes.object,
    screenSize: PropTypes.number
  };

  cashOut = async () => {
    const { actions, user, contract } = this.props;
    try {
      const decimals = contract.methods.decimals.cacheCall();

      let cashOut = await actions.cashOut();
      cashOut = cashOut || user.cashOut;

      const { sig } = cashOut;
      let amount = new web3.utils.BN(cashOut.amount.toString());
      let mult = new web3.utils.BN(10 ** (decimals / 2));
      mult = mult.mul(mult);
      amount = amount.mul(mult);

      // let result = await this.props.RelevantCoin.methods.cashOut(amount, sig).call();
      // console.log(result);
      contract.methods.cashOut.cacheSend(amount, sig, {
        from: user.ethAddress[0]
      });
      // console.log(result);
    } catch (err) {
      throw err;
    }
  };

  render() {
    const { user, wallet, screenSize } = this.props;
    if (!user) return null;
    const metaMaskTokens = wallet.connectedBalance || user.tokenBalance;
    const { airdropTokens, lockedTokens } = user;
    const stakingPower = user.balance
      ? Math.round(100 * (1 - lockedTokens / user.balance))
      : 0;
    // <Tooltip
    //   name='cashOut'
    //   text={'You can cash out your earnings once you earn 100 tokens'}
    // >
    return (
      <View m={['4 4 2 4', '2 2 0 2']}>
        {!screenSize ? (
          <View>
            <Header>Relevant Tokens</Header>
            <BodyText mt={2}>
              These are tokens you earned as rewards. Once you have more than{' '}
              {CASHOUT_LIMIT}, you can transfer them to your Ethereum account.
            </BodyText>
          </View>
        ) : null}
        <View br bl bt p="2" mt={2}>
          <View fdirection="row" justify="space-between" wrap>
            <BodyText mb={0.5}>Account Balance</BodyText>
            <SecondaryText mb={0.5}>{user.ethAddress[0]}</SecondaryText>
          </View>
          <View fdirection="row" align="center" display="flex" mt={2}>
            <CoinStat fs={4.5} lh={5} size={5} user={user} align="center" />
          </View>
        </View>
        <View border={1} p="2">
          <SecondaryText>
            {`Unclaimed REL: ${numbers.abbreviateNumber(user.balance)}`}
            {metaMaskTokens
              ? `   Metamask: ${numbers.abbreviateNumber(
                wallet.connectedBalance || user.tokenBalance
              )}`
              : ''}
            {airdropTokens
              ? `   Airdrop Coins: ${numbers.abbreviateNumber(user.airdropTokens)}`
              : ''}
            {lockedTokens
              ? `   Locked Coins: ${numbers.abbreviateNumber(lockedTokens)}`
              : ''}
            {stakingPower ? `   Staking Power: ${stakingPower}%` : ''}
          </SecondaryText>
        </View>
        {!screenSize ? (
          <View fdirection="row" mt={2} align="center">
            <Touchable onClick={this.cashOut} disabled>
              <LinkFont mr={0.5} c={colors.grey} td={'underline'}>
                Claim Tokens
              </LinkFont>
            </Touchable>
            <Image
              source={require('app/public/img/info.png')}
              s={1.5}
              h={1.5}
              w={1.5}
              m={0}
              data-for="mainTooltip"
              data-tip={JSON.stringify({
                type: 'TEXT',
                props: {
                  text: `Once you earn more than ${CASHOUT_LIMIT} tokens you\ncan transfer them to your Metamask wallet\n(temporarily disabled)`
                }
              })}
              // onPress={() => this.tooltip.show()}
            />
          </View>
        ) : null}
        <Header mt={[9, 4]}>Recent Activity</Header>
        {!screenSize ? (
          <BodyText mt={2}>
            Your rewards for upvoting links and discussion threads that are relevant to
            the community.
          </BodyText>
        ) : null}
      </View>
    );
  }
}
