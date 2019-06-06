import Web3 from 'web3';
import { INFURA_PROTOCOL, INFURA_NETWORK, INFURA_API_KEY } from 'core/config';

let web3;
let rpcUrl;
let metamask;

const defaultOptions = { rpcUrl: getRpcUrl(), metamask: null };

export function getMetamask() {
  return metamask || initMetamask();
}

export function getProvider(options = defaultOptions) {
  return options.metamask || options.rpcUrl !== defaultOptions.rpcUrl
    ? initProvider(options)
    : web3 || initProvider();
}

export function initMetamask() {
  metamask = typeof window !== 'undefined' && window.ethereum ? window.ethereum : null;
  return metamask;
}

export function initProvider(options = defaultOptions) {
  const provider = createProvider(options);
  web3 = new Web3(provider);
  return web3;
}

export function getBN(value, web3Instance = web3) {
  let val = new web3Instance.utils.BN(value);
  if (val.isZero()) return 0;
  val = val.div(new web3Instance.utils.BN('DE0B6B3A7640000'));

  return val.toString();
}

export function getRpcUrl() {
  return rpcUrl || buildRpcUrl();
}

export function createProvider(options = defaultOptions) {
  if (options.metamask) return options.metamask;
  return options.rpcUrl.slice(0, 2) === 'ws'
    ? new Web3.providers.WebsocketProvider(options.rpcUrl)
    : new Web3.providers.HttpProvider(options.rpcUrl);
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
