import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText } from 'modules/styled/uni';
import ContractProvider, { contractPropTypes } from 'modules/contract/contract.container';
import { useWarningStack, renderWarning } from 'modules/warningStack';
import { useWeb3, useMetamask, useBalance } from 'modules/contract/contract.hooks';
import { getProvider, generateSalt } from 'app/utils/eth';

const Alert = alert.Alert();
const web3 = getProvider();

const AddEthAddress = ({ ethState, ethActions, actions, user, modal, balance }) => {
  const [accounts, , networkId] = useWeb3(ethState, ethActions);
  const [_modal, setModal] = useState(false);
  const warningStack = useWarningStack(accounts, user, networkId);

  useBalance(ethState, ethActions);
  useMetamask(ethActions);
  useEffect(() => {
    if (!balance || (balance > 0 && _modal === false)) {
      setModal(true);
    }
  }, [balance]);

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
            const error = err || msg.error;
            // eslint-disable-next-line no-console
            console.error('Error: ', error);
            Alert('Error: ', error);
            return;
          }
          actions.addEthAddress(msgParams, msg.result, accounts[0]);
        }
      );
    } catch (err) {
      Alert('Failed signing message: ', err);
    }
  };
  const cashOut = () => actions.cashOutCall({ time: new Date() }, user, accounts);

  return (
    <Modal
      visible={modal === 'cashOut'}
      close={actions.hideModal}
      title="Claim Your Relevant Coins"
    >
      <View>
        <BodyText>Transfer Coins to your Ethereum Wallet</BodyText>
        {warningStack.length ? (
          renderWarning(warningStack[0], connectAddress)
        ) : (
          <Button mr={'auto'} mt={4} onClick={() => cashOut()}>
            Claim Relevant Coins
          </Button>
        )}
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
