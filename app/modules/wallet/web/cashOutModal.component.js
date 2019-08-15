import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText } from 'modules/styled/uni';
import ContractProvider, { contractPropTypes } from 'modules/contract/contract.container';
import { getProvider, formatBalanceWrite, generateSalt } from 'app/utils/eth';
import { NETWORK_NUMBER } from 'core/config';

const Alert = alert.Alert();
const web3 = getProvider();
const decimals = 18;

const AddEthAddress = ({
  actions,
  web3: _web3,
  web3Actions,
  user,
  accounts,
  modal,
  balance,
  cacheSend
}) => {
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
        {!accounts ? (
          <ConnectMetamask />
        ) : (
          <EnableMetamask getAccounts={web3Actions.accounts.getRequest} />
        )}
        {_web3.network.id && _web3.network.id !== NETWORK_NUMBER && <SwitchToMainnet />}
        {user.ethAddress.length &&
          accounts &&
          accounts[0] &&
          user.ethAddress[0] !== accounts[0] && <SwitchAccounts />}
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

const ConnectMetamask = () => (
  <BodyText mt={2}>
    Connect{' '}
    <a href="https://metamask.io/" target="_blank">
      Metamask
    </a>{' '}
    to securely connect to Ethereum.
  </BodyText>
);

const EnableMetamask = ({ getAccounts }) => (
  <BodyText mt={2}>
    Enable <a onClick={() => getAccounts()}>Metamask</a> to withdraw your tokens
  </BodyText>
);

EnableMetamask.propTypes = {
  getAccounts: PropTypes.func
};

const SwitchToMainnet = () => <BodyText>Switch to to Ehereum Mainnet</BodyText>;

const SwitchAccounts = () => (
  <BodyText>
    Your current Ethereum account doesn't match our records. Please switch to the account
    you used when signing up.
  </BodyText>
);

// TODO -- Add custom amount, account support
