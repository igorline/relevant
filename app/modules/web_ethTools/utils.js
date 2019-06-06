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

export function getBN(value) {
  const hex = value.get('_hex');
  if (hex === '0x00') {
    return 0;
  }
  return formatBN(hex, 18);
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

export function formatBN(hex, decimals = 18) {
  const numString = Number(hex).toString();

  if (numString[numString.length - 3] === '+') {
    const trailingZeroes = getTrailingZeros(numString, decimals);
    const result = Number(withoutZeros(numString) + trailingZeroes);

    return result;
  }
  return Number(numString);
}

export function withoutZeros(numString) {
  return numString.slice(0, -2).toString();
}

export function getTrailingZeros(numString, decimals) {
  return Number(Number(numString.slice(-2)) - decimals).toString();
}
