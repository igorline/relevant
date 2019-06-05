import Web3 from 'web3';
import { INFURA_PROTOCOL, INFURA_NETWORK, INFURA_API_KEY } from 'core/config';

let web3;
let rpcUrl;

const defaultOptions = { _rpcUrl: getRpcUrl(), metamask: null };

export function getMetamask() {
  return typeof window !== 'undefined' ? window.ethereum : null;
}

export function getProvider(options = defaultOptions) {
  return options.metamask || options._rpcUrl !== defaultOptions._rpcUrl
    ? initProvider(options)
    : web3 || initProvider();
}

export function initProvider(options = defaultOptions) {
  const provider = createProvider(options);
  web3 = new Web3(provider);
  return web3;
}

export function getBN(value, web3Instance = web3) {
  return new web3Instance.utils.BN(value);
}

export function getRpcUrl() {
  return rpcUrl || buildRpcUrl();
}

export function createProvider(options = defaultOptions) {
  if (options.metamask) return options.metamask;
  return options._rpcUrl.slice(0, 2) === 'ws'
    ? new Web3.providers.WebsocketProvider(options._rpcUrl)
    : new Web3.providers.HttpProvider(options._rpcUrl);
}

export function buildRpcUrl(
  protocol = INFURA_PROTOCOL,
  network = INFURA_NETWORK,
  apiKey = INFURA_API_KEY
) {
  rpcUrl = `${protocol}s://${network}.infura.io/${
    protocol === 'ws' ? 'ws/' : ''
  }v3/${apiKey}`;
  return rpcUrl;
}
