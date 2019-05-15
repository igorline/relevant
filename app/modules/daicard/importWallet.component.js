import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SecondaryText, Button, Text } from 'modules/styled/uni';
import Modal from 'modules/ui/web/modal';
import { Input } from 'modules/styled/web';
import { colors } from 'app/styles';
import { localStorage } from 'app/utils/storage';

export default class WithdrawModal extends Component {
  static propTypes = {
    modal: PropTypes.string,
    actions: PropTypes.object,
    createWallet: PropTypes.func,
    mnemonic: PropTypes.string
  };

  state = { mnemonic: '' };

  importWallet = () => {
    localStorage.setItem('mnemonic', this.state.mnemonic);
    this.props.createWallet();
  };

  render() {
    const { modal, actions, mnemonic: existingMnemonic } = this.props;
    const { mnemonic } = this.state;

    return (
      <Modal
        visible={modal === 'importWallet'}
        close={actions.hideModal}
        title={'Import Wallet'}
      >
        <SecondaryText c={colors.black}>Enter your backup phrase below:</SecondaryText>
        <Input
          value={mnemonic}
          onChange={e => this.setState({ mnemonic: e.target.value })}
          mt={2}
          placeholder="Enter Backup Phrase"
        />
        {existingMnemonic ? (
          <SecondaryText inline={1} mt={1} c={colors.red}>
            Warning! If you import a new wallet you may loose access to funds in the
            current wallet.
            {'\n'}
            Make sure you{' '}
            <Text
              inline={1}
              c={colors.blue}
              onClick={() => actions.showModal('backupPhrase')}
            >
              save your current backup phrase
            </Text>
            .
          </SecondaryText>
        ) : null}

        <Button onClick={() => this.importWallet()} mr={'auto'} mt={4}>
          Import
        </Button>
      </Modal>
    );
  }
}
