import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { colors } from 'app/styles';
import { connect } from 'react-redux';
import {
  View,
  Header,
  SecondaryText,
  Image,
  Touchable,
  BodyText,
  LinkFont,
  Text,
  Button
} from 'modules/styled/uni';
import * as cardActions from './card.actions';
import { getChannelBalanceInUSD } from './connext/currencyFormatting';

let daicard;
if (process.env.BROWSER === true) {
  daicard = require('./connext');
}

const RPC = 'MAINNET';

class CardContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    screenSize: PropTypes.number,
    address: PropTypes.string,
    connextState: PropTypes.object,
    channelState: PropTypes.object
  };

  state = {
    showCard: false
  };

  async componentDidMount() {
    this.connext = await daicard.initConnext({
      rpc: RPC,
      updateState: this.props.actions.updateConnextState
    });

    // start polling
    if (this.connext) this.connext.start();
    this.setState({ showCard: true });
  }

  componentWillUnmount() {
    if (!this.connext) return;
    this.connext.stop();
  }

  render() {
    if (!this.state.showCard) return null;
    const { screenSize, address, connextState, channelState } = this.props;
    const balance = getChannelBalanceInUSD(channelState, connextState);
    return (
      <View m={['4 4 2 4', '2 2 0 2']}>
        {!screenSize ? (
          <View>
            <Header>USD Balance</Header>
            <BodyText mt={2}>This is your USD wallet</BodyText>
          </View>
        ) : null}
        <View br bl bt p="2" mt={2}>
          <View fdirection="row" justify="space-between" wrap>
            <BodyText mb={0.5}>Account Balance</BodyText>
            <SecondaryText mb={0.5}>{address}</SecondaryText>
          </View>
          <View fdirection="row" align="center" display="flex" mt={2}>
            <Text fs={4.5} lh={5} size={5}>
              {balance}
            </Text>
          </View>
        </View>
        <View border={1} p="2">
          <SecondaryText>Test</SecondaryText>
        </View>
        {!screenSize ? (
          <View fdirection="row" mt={2} align="center">
            <Button mr={3} onClick={this.deposit}>
              Deposit
            </Button>
            <Touchable onClick={this.cashOut} disabled>
              <LinkFont mr={0.5} c={colors.grey} td={'underline'}>
                Cash Out
              </LinkFont>
            </Touchable>
            <Image
              source={require('app/public/img/info.png')}
              s={1.5}
              h={1.5}
              w={1.5}
              ml={0.5}
              // data-for="mainTooltip"
              // data-tip={JSON.stringify({
              //   type: 'TEXT',
              //   props: {
              //     text: `Once you earn more than ${CASHOUT_LIMIT}
              //     tokens you\ncan transfer them to your Metamask wallet\n(temporarily disabled)`
              //   }
              // })}
              // onPress={() => this.tooltip.show()}
            />
          </View>
        ) : null}
        <Header mt={[9, 4]}>Recent Activity</Header>
        {!screenSize ? (
          <BodyText mt={2}>This is a record of all your payments and rewards.</BodyText>
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  connextState: state.card.connextState,
  address: state.card.address,
  screenSize: state.navigation.screenSize,
  channelState: state.card.connextState.persistent
    ? state.card.connextState.persistent.channel
    : null

  // need these?
  // runtime: state.card.connextState.runtime,
  // exchangeRate: state.card.connextState.runtime.exchangeRate ?
  //  state.card.connextState.runtime.exchangeRate.rates.USD : 0
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...cardActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardContainer);
