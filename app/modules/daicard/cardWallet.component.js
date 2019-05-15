import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'modules/ui/web/modal';
import { localStorage } from 'app/utils/storage';
import { BodyText, View, Text, Button } from 'modules/styled/uni';
import { colors } from 'app/styles';
import Withdraw from './withdraw.component';
import Deposit from './deposit.component';
import CardBalance from './cardBalance.component';
import ImportWallet from './importWallet.component';
import CardContainer from './card.container';

class CardWallet extends Component {
  static propTypes = {
    actions: PropTypes.object,
    balance: PropTypes.string,
    modal: PropTypes.string,
    address: PropTypes.string,
    auth: PropTypes.object,
    isInitialized: PropTypes.bool,
    initConnext: PropTypes.func,
    connext: PropTypes.object,
    maxTokenDeposit: PropTypes.string
  };

  createWallet = async () => {
    const reinit = true;
    await this.props.initConnext(reinit);
    this.props.actions.showModal('backupPhrase');
  };

  render() {
    const { actions, modal, balance, connext, maxTokenDeposit } = this.props;

    const mnemonic = localStorage ? localStorage.getItem('mnemonic') : null;

    return (
      <React.Fragment>
        <CardBalance
          {...this.props}
          balance={balance}
          mnemonic={mnemonic}
          createWallet={this.createWallet}
        />
        <Withdraw {...this.props} balance={balance} connext={connext} />
        <Deposit {...this.props} maxTokenDeposit={maxTokenDeposit} />
        <ImportWallet
          {...this.props}
          mnemonic={mnemonic}
          createWallet={this.createWallet}
        />
        <Modal
          visible={modal === 'backupPhrase'}
          title="Backup Phrase"
          close={actions.hideModal}
        >
          <BodyText c={colors.red}>
            Make sure to save this phrase in a safe location.
          </BodyText>
          <BodyText c={colors.red}>
            If you loose this phrase you will loose access to your money.
          </BodyText>
          <View border={1} p={2} m={'2 0'}>
            <Text>{mnemonic}</Text>
          </View>
          <Button mt={2} mr={'auto'} onClick={actions.hideModal}>
            I have saved my backup phrase
          </Button>
        </Modal>
      </React.Fragment>
    );
  }
}

export default props => <CardContainer {...props} component={CardWallet} />;
