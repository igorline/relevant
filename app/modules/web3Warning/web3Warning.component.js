import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, BodyText, Title, View } from 'modules/styled/uni';

const DEFAULT_BG = 'rgba(0, 0, 0, 0.05)';
const DEFAULT_BORDER_C = '#000000';

Web3Warning.propTypes = {
  connectAddress: PropTypes.func,
  warning: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
};

// TODO -- Add custom account support
export default function Web3Warning({ connectAddress, warning }) {
  if (!warning) return null;

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
