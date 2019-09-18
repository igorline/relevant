import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'modules/ui/web/modal';
import { alert } from 'app/utils';
import { Button, View, BodyText } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import Web3Warning from 'modules/web3Warning/web3Warning.component';
import {
  useWeb3,
  useMetamask,
  useBalance,
  useRelevantActions,
  useTokenContract
} from 'modules/contract/contract.hooks';
import { useRelevantState } from 'modules/contract/contract.selectors';
import { useCurrentWarning } from 'modules/web3Warning/web3Warning.hooks';
import { getProvider, generateSalt, parseBN } from 'app/utils/eth';
import { ALLOW_CUSTOM_CASHOUT } from 'core/config';
import {
  addEthAddress,
  // cashOutFailure,
  updateUserTokenBalance,
  updateAuthUser
} from 'modules/auth/auth.actions';
import { hideModal } from 'modules/navigation/navigation.actions'; // eslint-disable-line
import styled from 'styled-components/primitives';
import { request as apiRequest } from 'app/utils/api';
import { actions, tokenAddress } from 'core/contracts';
import { colors } from 'styles';
import { ActivityIndicator } from 'react-native-web';

const Alert = alert.Alert();
const web3 = getProvider();

const TxProgress = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.modalBackground};
`;

export default function AddEthAddress() {
  const [accounts, , networkId] = useWeb3();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { userNonce } = useRelevantState();
  const nonce = userNonce && userNonce.phase === 'SUCCESS' && parseBN(userNonce.value);
  const unclaimedSig = user.cashOut && user.cashOut.nonce === nonce && user.cashOut;
  const { cacheMethod } = useRelevantActions();
  useTokenContract();
  const canClaim = user.balance - (user.airdroppedTokens || 0);

  const account = accounts && accounts[0];

  useBalance();
  useMetamask();
  useEffect(() => {
    account && cacheMethod('nonceOf', account);
  }, [account, cacheMethod]);

  const warning = useCurrentWarning({
    accounts,
    user,
    networkId,
    unclaimedSig,
    canClaim
  });

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
            Alert.alert('Error: ', error);
            return;
          }
          dispatch(addEthAddress(msgParams, msg.result, accounts[0]));
        }
      );
    } catch (err) {
      Alert.alert('Failed signing message: ', err);
    }
  };

  return (
    <Modal name="cashOut" title="Claim Your Relevant Coins">
      <View>
        <BodyText>Transfer Coins to your Ethereum Wallet</BodyText>
        {warning ? (
          <Web3Warning connectAddress={connectAddress} warning={warning} />
        ) : (
          <CashOutHandler
            canClaim={canClaim}
            account={account}
            unclaimedSig={unclaimedSig}
          />
        )}
      </View>
    </Modal>
  );
}

CashOutHandler.propTypes = {
  canClaim: PropTypes.number,
  account: PropTypes.string,
  unclaimedSig: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};

function CashOutHandler({ canClaim, account, unclaimedSig }) {
  const [currentTx, setCurrentTx] = useState();
  const [amount, setAmount] = useState(canClaim);
  const dispatch = useDispatch();

  const cashOut = async (customAmount = 0) => {
    try {
      const result = await apiRequest({
        method: 'POST',
        endpoint: 'user',
        path: '/cashOut',
        params: { customAmount }
      });
      dispatch(updateAuthUser(result));
      const { amount: amnt, sig } = result.cashOut;

      const tx = dispatch(
        actions.methods.claimTokens({ at: tokenAddress, from: account }).send(amnt, sig)
      );
      setCurrentTx(tx);
    } catch (err) {
      Alert.alert(err);
    }
  };

  const txStatus = useTxState(currentTx, setCurrentTx);
  const cashoutAmount = unclaimedSig && !currentTx ? unclaimedSig.amount / 1e18 : amount;
  const validateAmount = value => (value < 0 ? 0 : value > canClaim ? canClaim : value);

  return (
    <Fragment>
      {ALLOW_CUSTOM_CASHOUT && !unclaimedSig && (
        <Input
          type="number"
          placeholder="Claiming all coins 😎"
          max={canClaim}
          min={0}
          onChange={({ target: { value } }) => setAmount(validateAmount(value))}
          value={amount}
        />
      )}
      <Button mr={'auto'} mt={4} onClick={() => cashOut(cashoutAmount)}>
        Claim {cashoutAmount} Relevant Coins
      </Button>
      {txStatus === 'pending' && (
        <TxProgress align="center" justify={'center'}>
          <ActivityIndicator />
          <BodyText mt={2}>Processing Transaction</BodyText>
        </TxProgress>
      )}
    </Fragment>
  );
}

function useTxState(tx, setCurrentTx) {
  const dispatch = useDispatch();
  const { methodCache } = useRelevantState();
  if (!tx) return null;

  const cashoutTx = methodCache.select('claimTokens', ...tx.payload.args);
  const cashoutConfirm = methodCache.select(
    'claimTokens',
    ...tx.payload.args,
    'confirmations'
  );

  if (cashoutTx && cashoutTx.phase === 'ERROR') {
    Alert.alert(cashoutTx.value.get('message'));
    setCurrentTx(null);
    return 'error';
  }

  if (cashoutConfirm && cashoutConfirm.value) {
    Alert.alert('Transaction Completed!', 'success');
    dispatch(updateUserTokenBalance());
    setCurrentTx(null);
    dispatch(hideModal());
    return 'success';
  }

  return 'pending';
}
