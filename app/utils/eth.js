import Web3 from 'web3';
import crypto from 'crypto';
import { INFURA_PROTOCOL, INFURA_NETWORK, INFURA_API_KEY } from 'core/config';

let web3;
let rpcUrl;
let metamask;

const defaultOptions = { rpcUrl: getRpcUrl(), metamask: null };

export function truncateAddress(address) {
  if (!address) return null;
  return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
}

export function getNetworkName(id) {
  switch (parseInt(id, 10)) {
    case 1:
      return 'Mainnet';
    case 4:
      return 'Rinkeby';
    case 3:
      return 'Ropsten';
    case 5:
      return 'Goerli';
    case 42:
      return 'Kovan';
    default:
      return 'Unknown';
  }
}

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

export function parseBN(value) {
  return value && value.get ? getBN(value) : value;
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
  // console.log('numString', numString);
  if (numString[numString.length - 3] === '+') {
    const trailingZeroes = getTrailingZeros(numString, decimals);
    const result = Number(withoutZeros(numString) + trailingZeroes);

    return Number.parseFloat(result).toFixed(0);
  }
  if (numString.length > 18) {
    return Number(numString.slice(0, -18));
  }
  if (numString.length === 18) {
    return Number(`0.${numString}`);
  }
  return Number(numString);
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function formatBalanceRead(balString) {
  return `${balString.slice(0, -18)}.${balString.slice(-18)}`;
}

export function formatBalanceWrite(balString, decimals = 18) {
  return (balString * 10 ** decimals).toString();
}

export function appendZeroes(numString, amount) {
  return `${numString}${'0'.repeat(amount)}`;
}

export function removeDecimal(balString) {
  return balString.split('.').join('');
}

export function withoutZeros(numString) {
  return numString.slice(0, -2).toString();
}

export function getTrailingZeros(numString, decimals) {
  return Number(Number(numString.slice(-2)) - decimals).toString();
}
