export const metamask = {
  id: 1,
  title: 'Please download a Web3 wallet',
  message:
    "We'll need to connect your Metamask account before you can transfer coins. Connecting your Metamask to Relevant is not a transaction and totally free.",
  buttonText: 'Download Metamask',
  buttonAction: 'openMetamask'
};

export const connection = {
  id: 2,
  title: 'Connect Relevant to Metamask',
  message:
    "We'll need to connect your Metamask account before you can transfer coins. Connecting your Metamask to Relevant is not a transaction and totally free.",
  buttonText: 'Connect Account',
  buttonAction: 'connectAddress'
};

export const network = {
  id: 3,
  title: 'Use Metamask to switch Ethereum networks',
  message: 'Please connect to Ethereum Mainnet.',
  buttonText: 'Switch Networks',
  disabled: true,
  bg: 'rgba(208, 2, 27, 0.02)',
  bc: '#d0021b'
};

export const account = (ethAddress = '0x..') => ({
  id: 4,
  title: 'Account mismatch',
  message: `Your connected wallet address is different from the address linked to your Relevant account. Please select account ${ethAddress} in Metamask or connect your current account number to Relevant`,
  buttonText: 'Connect Current Accounts to Relevant',
  buttonAction: 'connectAddress',
  // disabled: false,
  bg: 'rgba(255, 159, 0, 0.02)',
  bc: '#f7931a'
});
