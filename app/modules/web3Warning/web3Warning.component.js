import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, BodyText, Title, View } from 'modules/styled/uni';
import { useWeb3 } from 'modules/contract/contract.hooks';
import { useCurrentWarning } from './web3Warning.hooks';

const DEFAULT_BG = 'rgba(0, 0, 0, 0.05)';
const DEFAULT_BORDER_C = '#000000';

Web3Warning.propTypes = {
  connectAddress: PropTypes.func,
  user: PropTypes.object
};

// TODO -- Add custom amount, account support
export default function Web3Warning({ connectAddress, user }) {
  const [accounts, , networkId] = useWeb3();

  const warning = useCurrentWarning(accounts, user, networkId);

  const { bg = DEFAULT_BG, bc = DEFAULT_BORDER_C } = warning;

  const onClick = () => {
    switch (warning.buttonAction) {
      case 'openMetamask':
        return () => window.open('https://metamask.io/', '_blank');
      case 'connectAddress':
        return () => connectAddress();
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <View mt={2} p={2} id={warning.id} bg={bg} border bc={bc}>
        <Title>{warning.title}</Title>
        <BodyText mt={1}>{warning.message}</BodyText>
      </View>
      {onClick && (
        <Button mr={'auto'} mt={4} onClick={onClick}>
          {warning.buttonText}
        </Button>
      )}
    </Fragment>
  );
}
