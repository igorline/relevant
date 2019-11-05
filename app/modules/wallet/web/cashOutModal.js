import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  View,
  BodyText,
  Title,
  SecondaryText,
  Warning,
  Text
} from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import Web3Warning from 'modules/wallet/web/web3Warning/web3Warning.component';
import {
  useWeb3,
  useMetamask,
  useRelevantActions,
  useTxState
} from 'modules/contract/contract.hooks';
import { useRelevantState } from 'modules/contract/contract.selectors';
import { useCurrentWarning } from 'modules/wallet/web/web3Warning/web3Warning.hooks';
import { parseBN } from 'app/utils/eth';
import { cashOutCall, connectAddress } from 'modules/wallet/wallet.actions';
import { updateCashoutLog } from 'modules/wallet/earnings.actions';
import { hideModal } from 'modules/navigation/navigation.actions'; // eslint-disable-line
import styled from 'styled-components/primitives';
import { colors, sizing } from 'styles';
import { ActivityIndicator } from 'react-native-web';
import { CASHOUT_MAX } from 'server/config/globalConstants';
import Tooltip from 'modules/tooltip/tooltip.component';
import { usePrice } from 'modules/wallet/price.context';
import { CashoutFooter } from './cashoutFooter';
// import ULink from 'modules/navigation/ULink.component';

const TxProgress = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colors.modalBackground};
`;

AddEthAddress.propTypes = {
  close: PropTypes.func
};

export default function AddEthAddress({ close }) {
  const [accounts, , networkId] = useWeb3();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const canClaim = user.balance - (user.airdroppedTokens || 0);
  const account = accounts && accounts[0];

  // useBalance();
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
      <Title>Claim Your Relevant Coins</Title>
      <BodyText mt={1} mb={4}>
        Transfer Coins to your Ethereum Wallet
      </BodyText>
      {warning ? (
        <Web3Warning
          connectAddress={() => dispatch(connectAddress(account))}
          warning={warning}
        />
      ) : (
        <CashOutHandler
          close={close}
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
  unclaimedSig: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  close: PropTypes.func
};

function CashOutHandler({ canClaim, account, unclaimedSig, close }) {
  const [currentTx, setCurrentTx] = useState();
  const user = useSelector(state => state.auth.user);
  const maxClaim =
    user.role === 'admin'
      ? Math.min(1000 * 1e6, canClaim)
      : Math.min(canClaim, Math.max(CASHOUT_MAX - user.cashedOut, 0));

  const initAmnt = unclaimedSig && !currentTx ? unclaimedSig.amount / 1e18 : maxClaim;

  const [amount, setAmount] = useState(initAmnt);
  const dispatch = useDispatch();

  const usdAmount = usePrice(amount, 'number');
  const maxUSD = usePrice(maxClaim);

  useEffect(() => {
    if (unclaimedSig) setAmount(unclaimedSig.amount / 1e18);
  }, [unclaimedSig]);

  const cashOut = async customAmount => {
    const tx = await dispatch(cashOutCall(customAmount, account));
    setCurrentTx(tx);
  };

  const txState = useTxState({
    tx: currentTx,
    method: 'claimTokens',
    callback: () => {
      dispatch(updateCashoutLog(user.cashOut.earningId));
      setCurrentTx(null);
    }
  });

  if (txState === 'success') {
    close();
  }

  const validateAmount = value => (value < 0 ? 0 : value > maxClaim ? maxClaim : value);

  return (
    <Fragment>
      {unclaimedSig && !currentTx && (
        <Warning mb={2}>
          Warning: You have not completed a previous transfer attempt, press the
          'Transfer' button below to complete.
        </Warning>
      )}{' '}
      <View fdirection={'row'}>
        <View flex={1} mr={1}>
          <Input
            mt={'0'}
            flex={1}
            type="number"
            onChange={({ target: { value } }) =>
              unclaimedSig ? amount : setAmount(validateAmount(value))
            }
            value={amount}
            h={6}
            fs={amount ? 4 : 2}
            p={'0 1.5 0 1.5'}
            fw={'bold'}
          />
          <Text
            h={6}
            style={{ right: sizing(1), bottom: sizing(0) }}
            position="absolute"
            fs={4}
          >
            {'$' + usdAmount}
          </Text>
        </View>
        <Button
          disabled={!amount || amount === ''}
          h={7}
          mr={'auto'}
          onClick={() => cashOut(amount)}
        >
          Transfer coins to wallet
        </Button>
      </View>
      <View fdirection="row">
        <SecondaryText mr={2} mt={1} onPress={() => setAmount(maxClaim)}>
          <Tooltip
            data={{
              text: 'This is the maximum amount of coins you can claim at this time.'
            }}
          />
          Maximum claim: {maxClaim}
          {maxUSD} Coins
        </SecondaryText>
        <SecondaryText mt={1}>
          <Tooltip data={{ text: 'Total unclaimed coins.' }} />
          Unclaimed: {canClaim} Coins
        </SecondaryText>
      </View>
      <CashoutFooter />
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
