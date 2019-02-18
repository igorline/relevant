import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'modules/tooltip/web/tooltip.component';
import EarningsComponent from 'modules/wallet/earnings.component';
import { colors } from 'app/styles';
import { numbers } from 'app/utils';
import {
  View,
  BodyText,
  Header,
  SecondaryText,
  NumericalValue,
  Touchable,
  Image,
  LinkFont
} from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';

export default class Balance extends Component {
  static propTypes = {
    user: PropTypes.object,
    contract: PropTypes.object,
    actions: PropTypes.object,
    wallet: PropTypes.object
  };

  async cashOut() {
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
  }

  render() {
    const { user, wallet } = this.props;
    if (!user) {
      return null;
    }
    return (
      <View m={4}>
        <Tooltip id="tooltip" />
        <Header>Relevant Tokens</Header>
        <BodyText mt={2}>
          These are tokens you earned as rewards. Once you have more than 100, you can
          transfer them to your Ethereum account.
        </BodyText>
        <View br bl bt p="2" mt={2}>
          <View fdirection="row" justify="space-between">
            <BodyText>Account Balance</BodyText>
            <SecondaryText>{user.ethAddress[0]}</SecondaryText>
          </View>
          <View fdirection="row" align="center" display="flex" mt={2}>
            <NumericalValue fs={4.5} lh={4.5} mr={2}>
              <CoinStat size={4.5} inheritfont user={user} align="center" />
            </NumericalValue>
          </View>
        </View>
        <View border={1} p="2">
          <SecondaryText>
            {`Unclaimed RNT: ${numbers.abbreviateNumber(user.balance)}`}
            {`   Metamask: ${numbers.abbreviateNumber(
              wallet.connectedBalance || user.tokenBalance
            )}`}
          </SecondaryText>
        </View>
        <Touchable onClick={this.cashOut} mt={2}>
          <View fdirection="row" align="center">
            <Image
              source={'/img/info.png'}
              s={1.5}
              h={1.5}
              w={1.5}
              m={0}
              data-for="tooltip"
              data-tip={JSON.stringify({
                type: 'TEXT',
                props: { text: 'Claim your tokens!' }
              })}
            />
            <LinkFont ml={0.5} c={colors.blue} td={'underline'}>
              Claim Tokens
            </LinkFont>
          </View>
        </Touchable>
        <Header mt={9}>Recent Activity</Header>
        <BodyText mt={2}>
          Your recent activities on relevant from winning Relevant Bonus Tokens.
        </BodyText>
        <EarningsComponent pageSize={10} />
      </View>
    );
  }
}
