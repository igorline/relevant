import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
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

export default class CardContainer extends Component {
  static propTypes = {
    screenSize: PropTypes.number,
    address: PropTypes.string,
    actions: PropTypes.object,
    balance: PropTypes.string
  };

  render() {
    const { screenSize, address, balance, actions } = this.props;
    return (
      <View m={['4 4 2 4', '2 2 0 2']}>
        {!screenSize ? (
          <View>
            <Header>USD Balance</Header>
            <BodyText mt={2}>
              This is your USD wallet. This is actual money denominated in DAI, stable
              token worth $1
            </BodyText>
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
            <Button mr={3} onClick={() => actions.showModal('depositModal')}>
              Deposit
            </Button>
            <Touchable onClick={() => actions.showModal('withdrawModal')} disabled>
              <LinkFont mr={0.5} c={colors.blue} td={'underline'}>
                Cash Out
              </LinkFont>
            </Touchable>
            <Image
              source={require('app/public/img/info.png')}
              s={1.5}
              h={1.5}
              w={1.5}
              ml={0.5}
              data-for="mainTooltip"
              data-tip={JSON.stringify({
                type: 'TEXT',
                props: {
                  text: 'Tranfer ETH to your metamask wallet'
                }
              })}
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
