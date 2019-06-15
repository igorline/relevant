import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText, SecondaryText } from 'modules/styled/uni';
import ContractProvider, { contractPropTypes } from 'modules/contract/contract.container';
import {
  getProvider,
  formatBalanceWrite,
  generateSalt
} from 'modules/web_ethTools/utils';

const Alert = alert.Alert();
const web3 = getProvider();
const decimals = 18;

const AddEthAddress = ({ actions, user, accounts, modal, balance, cacheSend }) => {
  const _cashOut = async () => {
    try {
      if (!user.ethAddress.length) await connectAddress();

      let cashOut = await actions.cashOut();
      cashOut = cashOut || user.cashOut;
      const { sig, amount: _amount } = cashOut;
      const amount = formatBalanceWrite(_amount, decimals);

      if (accounts[0]) {
        cacheSend('claimTokens', { from: accounts[0] }, amount, sig);
      }
    } catch (err) {
      throw err;
    }
  };

  const connectAddress = async () => {
    try {
      const salt = generateSalt();
      const msgParams = [
        {
          type: 'string',
          name: 'Message',
          value: 'Connect Ethereum address to the Relevant account ' + salt
        }
      ];

      await web3.currentProvider.connection.sendAsync(
        {
          method: 'eth_signTypedData',
          params: [msgParams, accounts[0]],
          from: accounts[0]
        },
        (err, msg) => {
          if (err || msg.error) {
            // eslint-disable-next-line no-console
            console.error('Error: ', err || msg.error);
            return;
          }
          actions.addEthAddress(msgParams, msg.result, accounts[0]);
        }
      );
    } catch (err) {
      Alert('failed signing message ', err);
    }
  };

  const [_modal, setModal] = useState(false);
  useEffect(() => {
    if (!balance || (balance > 0 && _modal === false)) {
      setModal(true);
    }
  }, [balance]);

  return (
    <Modal
      visible={modal === 'cashOut'}
      close={actions.hideModal}
      title={'Claim Your Relevant Coins'}
    >
      <View>
        <BodyText>
          This will transfer the coins you have to your Ethereum wallet.
        </BodyText>
        <BodyText mt={2}>TODO: show prompt to install Metamask if no Metamask</BodyText>
        <SecondaryText>
          Like this: *We'll need to connect your account, it is not a transaction and is
          totally free
        </SecondaryText>
        <BodyText>
          TODO: explain if no account is connected to db (prompt to sign tx)
        </BodyText>
        <BodyText>TODO: warning if network mismatch</BodyText>
        <BodyText>TODO: warning if current account mismatch</BodyText>
        <BodyText>TODO: warning if current account mismatch</BodyText>
        <BodyText>TODO: add custom amount?</BodyText>
        <BodyText>TODO: add custom address?</BodyText>

        <Button mr={'auto'} mt={4} onClick={() => _cashOut()}>
          Claim Relevant Coins
        </Button>
      </View>
    </Modal>
  );
};

AddEthAddress.propTypes = {
  ...contractPropTypes,
  actions: PropTypes.object,
  balance: PropTypes.number,
  modal: PropTypes.string,
  user: PropTypes.object
};

export default ContractProvider(AddEthAddress);

// To allacote Rewards -- cacheSend('allocateRewards', { from: accounts[0] }, rewardsToAllocate);
