import React from 'react';
import { CASHOUT_LIMIT } from 'server/config/globalConstants';
import { Text } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import { truncateAddress } from 'utils/eth';
import { colors } from 'styles';

export const metamask = {
  id: 1,
  title: 'No Ethereum wallet found',
  message: (
    <Text inline={1}>
      You will need to install an Ethereum wallet, like{' '}
      <ULink to="https://metamask.io/" external target="_blank">
        Metamask
      </ULink>{' '}
      in order to claim your coins.{'\n\n'}*Note: you will also need to purchace a small
      amount of Ethereum in order to pay for the transaction.
    </Text>
  ),
  bc: colors.error,
  bg: colors.errorA,
  buttonText: 'Get Metamask',
  buttonAction: 'getMetamask'
};

export const connection = {
  id: 2,
  title: 'Connect Relevant to Metamask',
  message:
    "We'll need to connect your Metamask account before you can transfer coins. Connecting your Metamask to Relevant is not a transaction and totally free.",
  buttonText: 'Connect Account',
  buttonAction: 'connectAddress',
  bc: colors.warning,
  bg: colors.warningA
};

export const network = {
  id: 3,
  title: 'Use Metamask to switch Ethereum networks',
  message: 'Please connect to Ethereum Mainnet.',
  buttonText: 'Switch Networks',
  disabled: true,
  bc: colors.error,
  bg: colors.errorA
};

export const account = (ethAddress = '0x..') => ({
  id: 4,
  title: `Account mismatch (wanted: ${truncateAddress(ethAddress)})`,
  message: `Your connected wallet address is different from the address linked to your Relevant account. Please select account ${truncateAddress(
    ethAddress
  )} in Metamask. Alternately you can connect a new account address to Relevant.`,
  buttonText: 'Connect Current Account to Relevant',
  buttonAction: 'connectAddress',
  bc: colors.warning,
  bg: colors.warningA
});

export const balance = {
  id: 5,
  title: 'Your balance is too low',
  message: `Your current balance is too low, you need to earn more than ${CASHOUT_LIMIT} coins in order to be able to cash out.`,
  disabled: true,
  bc: colors.warning,
  bg: colors.warningA
};

export const connectMetamask = {
  id: 1,
  title: 'Log into Metamask and Connect it to Relevant',
  message: 'Make sure you are logged into Metamask and have connected it to Relevant',
  bc: colors.warning,
  bg: colors.warningA,
  buttonText: 'Connect Metamask',
  buttonAction: 'connectMetamask'
};
