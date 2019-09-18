import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, View, BodyText, Title } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import Web3Warning from 'modules/web3Warning/web3Warning.component';
import {
  useWeb3,
  useMetamask,
  useBalance,
  useRelevantActions,
  useTxState
} from 'modules/contract/contract.hooks';
import { useRelevantState } from 'modules/contract/contract.selectors';
import { useCurrentWarning } from 'modules/web3Warning/web3Warning.hooks';
import { parseBN } from 'app/utils/eth';
import { ALLOW_CUSTOM_CASHOUT } from 'core/config';
import { cashOutCall, connectAddress } from 'modules/wallet/wallet.actions';
import { hideModal } from 'modules/navigation/navigation.actions'; // eslint-disable-line
import styled from 'styled-components/primitives';
import { colors } from 'styles';
import { ActivityIndicator } from 'react-native-web';

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

  const canClaim = user.balance - (user.airdroppedTokens || 0);
  const account = accounts && accounts[0];

  useBalance();
  useMetamask();

  const unclaimedSig = useUnclaimedSig(user, account);

  const warning = useCurrentWarning({
    accounts,
    user,
    networkId,
    unclaimedSig,
    canClaim
  });

  return (
    <View>
      <Title mb={4}>Claim Your Relevant Coins</Title>
      <BodyText>Transfer Coins to your Ethereum Wallet</BodyText>
      {warning ? (
        <Web3Warning
          connectAddress={() => dispatch(connectAddress(account))}
          warning={warning}
        />
      ) : (
        <CashOutHandler
          canClaim={canClaim}
          account={account}
          unclaimedSig={unclaimedSig}
        />
      )}
    </View>
  );
}

CashOutHandler.propTypes = {
  canClaim: PropTypes.number,
  account: PropTypes.string,
  unclaimedSig: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};

function CashOutHandler({ canClaim, account, unclaimedSig }) {
  const [currentTx, setCurrentTx] = useState();
  const initAmnt = unclaimedSig && !currentTx ? unclaimedSig.amount / 1e18 : canClaim;
  const [amount, setAmount] = useState(initAmnt);
  const dispatch = useDispatch();

  const cashOut = async customAmount => {
    const tx = await dispatch(cashOutCall(customAmount, account));
    setCurrentTx(tx);
  };

  const txState = useTxState({
    tx: currentTx,
    method: 'claimTokens',
    clearTx: () => setCurrentTx(null)
  });

  if (txState === 'success') dispatch(hideModal());

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
      <Button mr={'auto'} mt={4} onClick={() => cashOut(amount)}>
        Claim {amount} Relevant Coins
      </Button>
      {txState === 'pending' && (
        <TxProgress align="center" justify={'center'}>
          <ActivityIndicator />
          <BodyText mt={2}>Processing Transaction</BodyText>
        </TxProgress>
      )}
    </Fragment>
  );
}

function useUnclaimedSig(user, account) {
  const { userNonce } = useRelevantState();
  const nonce = userNonce && userNonce.phase === 'SUCCESS' && parseBN(userNonce.value);
  const unclaimedSig =
    user && user.cashOut && user.cashOut.nonce === nonce && user.cashOut;

  const { cacheMethod } = useRelevantActions();

  useEffect(() => {
    account && cacheMethod('nonceOf', account);
  }, [account, cacheMethod]);

  return unclaimedSig;
}
