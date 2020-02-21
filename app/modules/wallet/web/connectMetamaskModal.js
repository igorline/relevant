import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, BodyText, Title } from 'modules/styled/uni';
import Web3Warning from 'modules/wallet/web/web3Warning/web3Warning.component';
import { useWeb3, useMetamask, useBalance } from 'modules/contract/contract.hooks';
import { useCurrentWarning } from 'modules/wallet/web/web3Warning/web3Warning.hooks';
import { connectAddress } from 'modules/wallet/wallet.actions';
import { hideModal } from 'modules/navigation/navigation.actions'; // eslint-disable-line
import { usePrice } from 'modules/wallet/price.context';
import { CashoutFooter } from './cashoutFooter';

AddEthAddress.propTypes = {
  close: PropTypes.func
};

export default function AddEthAddress({ close }) {
  const [accounts, , networkId] = useWeb3();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const canClaim = user.balance - (user.airdropTokens || 0);
  const account = accounts && accounts[0];

  useMetamask();

  const warning = useCurrentWarning({
    accounts,
    user,
    networkId,
    canClaim
  });

  const title = warning
    ? 'Connect Your Ethereum Wallet'
    : 'Ethereum Address is Connected';

  return (
    <View>
      <Title>{title}</Title>
      {warning ? (
        <Web3Warning
          connectAddress={() => dispatch(connectAddress(account))}
          warning={warning}
        />
      ) : (
        <Connected close={close} account={account} />
      )}
    </View>
  );
}

Connected.propTypes = {
  account: PropTypes.string
};

function Connected({ account }) {
  const balance = useBalance();
  const usdAmount = usePrice(balance, 'number');

  return (
    <Fragment>
      <BodyText mt={4}>Connected account: {account}</BodyText>
      <BodyText mt={2}>
        Balance in Ethereum wallet: {balance} REL (${usdAmount})
      </BodyText>
      <CashoutFooter />
    </Fragment>
  );
}
