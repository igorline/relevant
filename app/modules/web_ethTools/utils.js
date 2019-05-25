import Web3 from 'web3';

// TODO -- Use env variables, allow provider options
export function initProvider() {
  const rpcUrl = 'wss://rinkeby.infura.io/ws/v3/5c38fb06b79445928b582019d6a72e57';
  const provider = new Web3.providers.WebsocketProvider(rpcUrl);
  const web3 = new Web3(provider);
  return web3;
}

export function getBN(web3Instance, value) {
  return new web3Instance.utils.BN(value);
}
