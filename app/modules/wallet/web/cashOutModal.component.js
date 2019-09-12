import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import Web3Warning from 'modules/web3Warning/web3Warning.component';
import { useWeb3, useMetamask, useBalance } from 'modules/contract/contract.hooks';
// import { useEthState } from 'modules/contract/contract.selectors';
import { useCurrentWarning } from 'modules/web3Warning/web3Warning.hooks';
import { getProvider, generateSalt } from 'app/utils/eth';
import { ALLOW_CUSTOM_CASHOUT } from 'core/config';
import { cashOutCall, addEthAddress } from 'modules/auth/auth.actions';
import { hideModal } from 'modules/navigation/navigation.actions';

const Alert = alert.Alert();
const web3 = getProvider();

function AddEthAddress() {
  const [accounts, , networkId] = useWeb3();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  // const ethState = useEthState();
  // console.log(ethState);

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
          dispatch(addEthAddress(msgParams, msg.result, accounts[0]));
        }
      );
    } catch (err) {
      Alert('Failed signing message: ', err);
    }
  };
  const cashOut = async (customAmount = 0) => {
    try {
      // TODO how do we track the progress of this transaction
      await dispatch(
        cashOutCall(
          { time: new Date(), errorHandler: Alert },
          user,
          accounts,
          customAmount
        )
      );
      dispatch(hideModal());
    } catch (err) {
      Alert(err);
    }
  };

  const CashOutHandler = () => {
    const canClaim = user.balance - (user.airdroppedTokens || 0);
    const [amount, setAmount] = useState(canClaim);
    return (
      <Fragment>
        {ALLOW_CUSTOM_CASHOUT && (
          <Fragment>
            <Input
              placeholder="Claiming all tokens 😎"
              onChange={({ target: { value } }) => setAmount(value)}
              value={amount}
            />
          </Fragment>
        )}
        <Button mr={'auto'} mt={4} onClick={() => cashOut(amount)}>
          Claim {amount} Relevant Coins
        </Button>
      </Fragment>
    );
  };

  return (
    <Modal name="cashOut" title="Claim Your Relevant Coins">
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
