import request from 'request-promise-any';
import { ethers } from 'ethers';
import { INFURA_NETWORK, NETWORK_NUMBER } from 'app/core/config';

const RelevantToken = require('../../app/contracts/RelevantToken.json');

let decimals;
let instance;
let rpcUrl;
let provider;
let network;
let key;
let tokenAddress;
let web3;
let initialized = false;
let wallet;

const pendingTx = {};

process.on('exit', () => {
  // eslint-disable-next-line
  console.log('Un-executed Pending Transactions: ', pendingTx);
});

export const isInitialized = () => initialized;
export const getWeb3 = () => web3;

// SECURITY - this should never by exposed via any APIs!
export const getInstance = () => instance;

export async function init() {
  try {
    // SECURITY - this env var should never by exposed via any APIs!
    if (process.env.NODE_ENV === 'production') {
      key = process.env.OWNER_KEY;
      if (!key) return false;

      provider = ethers.getDefaultProvider(INFURA_NETWORK);
      tokenAddress = RelevantToken.networks[NETWORK_NUMBER]
        ? RelevantToken.networks[NETWORK_NUMBER].address
        : null;
    } else {
      key = process.env.TEST_KEY;
      if (!key) return false;

      rpcUrl = process.env.TEST_RPC;
      provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      network = await provider.getNetwork();
      tokenAddress = RelevantToken.networks[network.chainId].address;
    }

    wallet = new ethers.Wallet(key, provider);
    instance = new ethers.Contract(tokenAddress, RelevantToken.abi, provider);

    // SECURITY - this should never by exposed via any APIs!
    instance = instance.connect(wallet);

    decimals = await instance.decimals();
    initialized = true;
    return true;
  } catch (err) {
    throw err;
  }
}

export async function getBalance(address) {
  if (!instance) return 0;
  const balance = await instance.balanceOf(address);
  return balance.div((10 ** decimals).toString()).toNumber();
}

export async function getParam(param, opt) {
  if (!initialized) await init();

  let value = await instance[param]();
  if (!opt || !opt.noConvert) value = value.div((10 ** decimals).toString());
  if (!opt || !opt.string) value = parseFloat(value.toString());
  return value;
}

export async function getGasPrice() {
  const gasPrice = await request('https://ethgasstation.info/json/ethgasAPI.json');
  const price = JSON.parse(gasPrice);
  console.log('gas price', price.fast); // eslint-disable-line
  return price.fast;
}

// SECURITY - this function should never by exposed via any APIs!
export async function sendTx({ method, args, cancelPendingTx }) {
  try {
    const gasPrice = await getGasPrice();
    const nonce = await provider.getTransactionCount(wallet.address);
    console.log('current nonce', nonce); // eslint-disable-line
    const optNonce = cancelPendingTx ? { nonce } : {};
    const options = {
      gasPrice: gasPrice * 1e8,
      gasLimit: 6e6,
      ...optNonce
    };
    const tx = await instance[method](...args, options);
    pendingTx[method] = tx;
    const result = await tx.wait();
    delete pendingTx[method];
    console.log('status:', result.status); // eslint-disable-line
    console.log(`gas used by ${method}: ${result.gasUsed}`); // eslint-disable-line
    return result;
  } catch (err) {
    throw err;
  }
}

function toBN(num) {
  return ethers.utils.parseUnits((num / 10 ** decimals).toString(), decimals);
}

export async function mintRewardTokens() {
  if (!instance) await init();
  const lastMint = await instance.roundsSincleLast();
  if (lastMint.toNumber() === 0) return null;
  return sendTx({ method: 'releaseTokens', args: [], overWritePending: true });
}

export async function allocateRewards(_amount) {
  return sendTx({ method: 'allocateRewards', args: [toBN(_amount)] });
}

export async function allocateAirdrops(_amount) {
  return sendTx({ method: 'allocateAirdrops', args: [toBN(_amount)] });
}

export async function getNonce(_account) {
  const nonce = await instance.nonceOf(_account);
  return nonce.toNumber();
}

export async function sign(_account, _amount) {
  const nonce = await getNonce(_account);
  // const amnt = ethers.utils.bigNumberify((_amount * 10 ** 18).toString());
  const amnt = ethers.utils.parseUnits(_amount.toString(), decimals);
  const hash = ethers.utils.solidityKeccak256(
    ['uint256', 'address', 'uint256'],
    [amnt.toString(), _account, nonce]
  );
  const ethSig = await wallet.signMessage(ethers.utils.arrayify(hash));
  return ethSig;
}
