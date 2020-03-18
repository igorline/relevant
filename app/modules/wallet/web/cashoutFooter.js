import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { truncateAddress } from 'utils/eth';
import { getNetworkName } from 'utils/web3.provider';
import { useWeb3State } from 'modules/contract/contract.selectors';
import { BodyText, View, Divider } from 'modules/styled/uni';

CashoutFooter.propTypes = {
  customButton: PropTypes.node
};

export function CashoutFooter({ customButton }) {
  const web3 = useWeb3State();
  const rightEl = customButton || (
    <BodyText>Connected to Ethereum {getNetworkName(web3.networkId)}</BodyText>
  );

  const account = web3.accounts && web3.accounts[0];
  const leftEl = account ? <BodyText>{truncateAddress(account)}</BodyText> : <BodyText />;
  return (
    <Fragment>
      <Divider mt={4} mb={4} />
      <View fdirection="row" justify="space-between">
        <View>{leftEl}</View>
        <View>{rightEl}</View>
      </View>
    </Fragment>
  );
}
