import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import Web3Warning from 'modules/web3Warning/web3Warning.component';
import { useWeb3, useMetamask, useBalance } from 'modules/contract/contract.hooks';
import { useCurrentWarning } from 'modules/web3Warning/web3Warning.hooks';
import { getProvider, generateSalt } from 'app/utils/eth';
import { ALLOW_CUSTOM_CASHOUT } from 'core/config';

const Alert = alert.Alert();
const web3 = getProvider();

AddEthAddress.propTypes = {
  actions: PropTypes.object,
  // balance: PropTypes.number,
  modal: PropTypes.string,
  user: PropTypes.object
};

function AddEthAddress({ actions, user, modal /* balance */ }) {
  const [accounts, , networkId] = useWeb3();

  useBalance();
  useMetamask();

  const warning = useCurrentWarning(accounts, user, networkId);

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
  const cashOut = (customAmount = 0) =>
    actions.cashOutCall(
      { time: new Date(), errorHandler: Alert },
      user,
      accounts,
      customAmount
    );
  const CashOutHandler = () => {
    const [useCustomAmt, toggleCustomAmt] = useState(false);
    const [customAmount, setCustomAmount] = useState(0);
    return (
      <Fragment>
        <Button mr={'auto'} mt={4} onClick={() => cashOut(customAmount)}>
          Claim {!useCustomAmt ? 'all redeemeable' : customAmount} Relevant Coins.
        </Button>
        {ALLOW_CUSTOM_CASHOUT && (
          <Fragment>
            <Button mr={'auto'} mt={1} onClick={() => toggleCustomAmt(!useCustomAmt)}>
              Toggle custom amt
            </Button>
            <Input
              placeholder="Claiming all tokens 😎"
              disabled={useCustomAmt}
              onChange={({ target: { value } }) => setCustomAmount(value)}
              value={customAmount}
            />
          </Fragment>
        )}
      </Fragment>
    );
  };

  return (
    <Modal
      visible={modal === 'cashOut'}
      close={actions.hideModal}
      title="Claim Your Relevant Coins"
    >
      <View>
        <BodyText>Transfer Coins to your Ethereum Wallet</BodyText>
        {warning ? (
          <Web3Warning connectAddress={connectAddress} warning={warning} />
        ) : (
          <CashOutHandler />
        )}
      </View>
    </Modal>
  );
}

export default AddEthAddress;
