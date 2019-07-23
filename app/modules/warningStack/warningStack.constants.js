export const metamask = {
  id: 1,
  title: 'Please download a Web3 wallet',
  message:
    "We'll need to connect your Metamask account before you can transfer coins. Connecting your Metamask to Relevant is not a transaction and totally free.",
  buttonText: 'Download Metamask',
  onClick: () => window.open('https://metamask.io/', '_blank')
};

export const connection = {
  id: 2,
  title: 'Connect Relevant to Metamask',
  message:
    "We'll need to connect your Metamask account before you can transfer coins. Connecting your Metamask to Relevant is not a transaction and totally free.",
  buttonText: 'Connect Account'
};

export const network = {
  id: 3,
  title: 'Use Metamask to switch Ethereum networks',
  message: 'Please connect to Ethereum Mainnet.',
  buttonText: 'Switch Networks',
  disabled: true,
  styling: {
    bottom: '36.22%',
    background: 'rgba(208, 2, 27, 0.02)',
    borderColor: '#d0021b'
  }
};

export const account = (ethAddress = '0x..') => ({
  id: 4,
  title: 'Account mismatch',
  message: `Your connected wallet address is different from the address linked to your Relevant account. Please select account ${ethAddress} in Metamask`,
  buttonText: 'Switch Accounts',
  disabled: true,
  styling: {
    bottom: '27.55%',
    background: 'rgba(255, 159, 0, 0.02)',
    borderColor: '#f7931a'
  }
});
