import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, BodyText, Title, View } from 'modules/styled/uni';
import { useMetamask } from 'modules/contract/contract.hooks';
import { CashoutFooter } from 'modules/wallet/web/cashoutFooter';

const DEFAULT_BG = 'rgba(0, 0, 0, 0.05)';
const DEFAULT_BORDER_C = '#000000';

Web3Warning.propTypes = {
  connectAddress: PropTypes.func,
  warning: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
};

export default function Web3Warning({ connectAddress, warning }) {
  const { bg = DEFAULT_BG, bc = DEFAULT_BORDER_C } = warning;
  const metamask = useMetamask();
  if (!warning) return null;

  const onClickCreator = () => {
    switch (warning.buttonAction) {
      case 'connectMetamask':
        return () => metamask.enable();
      case 'getMetamask':
        return () => window.open('https://metamask.io/', '_blank');
      case 'connectAddress':
        return () => connectAddress();
      default:
        return null;
    }
  };
  const onClick = onClickCreator();

  const customButton = onClick && (
    <Button disabled={warning.disabled} mr={'auto'} onClick={onClick}>
      {warning.buttonText}
    </Button>
  );

  return (
    <Fragment>
      <View mt={2} p={2} id={warning.id} bg={bg} border bc={bc}>
        <Title>{warning.title}</Title>
        <BodyText mt={1}>{warning.message}</BodyText>
      </View>
      <CashoutFooter customButton={customButton} />
    </Fragment>
  );
}
