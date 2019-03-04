import Web3 from 'web3';
import contract from 'truffle-contract';
import EthereumTx from 'ethereumjs-tx';

const contractData = require('../../app/contracts/RelevantToken.json');

const RelevantToken = contract(contractData);

function fixTruffleContractCompatibilityIssue(_contract) {
  if (typeof _contract.currentProvider.sendAsync !== 'function') {
    _contract.currentProvider.sendAsync = (...args) =>
      _contract.currentProvider.send(...args);
  }
  return _contract;
}

let decimals;
let instance;
let account;
let key;
let web3;
let initialized = false;
// const nextNonce = 0;

export const isInitialized = () => initialized;
export const getWeb3 = () => web3;
export const getInstance = () => instance;

export async function init() {
  try {
    let rpcUrl = `https://${process.env.INFURA_NETWORK}.infura.io/${
      process.env.INFURA_API_KEY
    }`;

    key = process.env.OWNER_KEY;
    account = process.env.OWNER_ACC;

    if (process.env.NODE_ENV === 'test') {
      rpcUrl = process.env.TEST_RPC;
      key = process.env.TEST_KEY;
      account = process.env.TEST_ACCOUNT;
    }

    const provider = new Web3.providers.HttpProvider(rpcUrl);
    RelevantToken.setProvider(provider);

    web3 = new Web3(provider);

    fixTruffleContractCompatibilityIssue(RelevantToken);
    instance = await RelevantToken.deployed();
    decimals = await instance.decimals.call();
    decimals = decimals.toNumber();
    initialized = true;
    return true;
  } catch (err) {
    throw err;
  }
}

export async function getBalance(address) {
  if (!instance) return 0;
  const balance = await instance.balanceOf.call(address);
  return balance.div(10 ** decimals).toNumber();
}

export async function getParam(param, opt) {
  let value = await instance[param].call();
  if (!opt || !opt.noConvert) value = value.div(10 ** decimals);
  if (!opt || !opt.string) value = value.toNumber();
  return value;
}

export async function sendTx(params) {
  try {
    const { acc, accKey, value, data, fn } = params;
    const nonce = await web3.eth.getTransactionCount(acc);

    // hack to update nonce, but could still fail
    // nonce = Math.max(nonce, nextNonce);
    // nextNonce = nonce + 1;
    const pk = Buffer.from(accKey, 'hex');

    const txParams = {
      jsonrpc: '2.0',
      nonce: web3.utils.numberToHex(nonce),
      gasPrice: web3.utils.numberToHex(21 * 1e9), // '0x14f46b0400',
      gasLimit: web3.utils.numberToHex(6e6),
      to: instance.address,
      value: web3.utils.numberToHex(value),
      data,
      // EIP 155 chainId - mainnet: 1, ropsten: 3
      chainId: 4
    };

    const tx = new EthereumTx(txParams);
    tx.sign(pk);
    const serializedTx = tx.serialize();

    const transactionHash = await web3.eth
    .sendSignedTransaction('0x' + serializedTx.toString('hex'))
    .on('receipt', r => {
        console.log(`status : ${r.status}`); // eslint-disable-line
        console.log(`gas used by ${fn}: ${r.gasUsed}`); // eslint-disable-line
    })
    .on('error', err => {
      throw err;
    });
    return transactionHash;
  } catch (err) {
    throw err;
  }
}

// export async function buyTokens(acc, accKey, _value) {
//   const value = web3.utils.toWei(_value.toString(), 'ether');
//   const { data } = instance.buy.request().params[0];
//   return sendTx({ data, acc, accKey, value, fn: 'buyTokens' });
// }

export async function mintRewardTokens() {
  if (!instance) await init();
  const lastMint = await instance.roundsSincleLast.call();
  if (lastMint.toNumber() === 0) return null;
  const { data } = instance.releaseTokens.request().params[0];
  return sendTx({ data, acc: account, accKey: key, value: 0, fn: 'releaseTokens' });
}

export async function allocateRewards(_amount) {
  const data = await instance.allocateRewards.request(_amount).params[0].data;
  return sendTx({ data, acc: account, accKey: key, value: 0, fn: 'allocateRewards' });
}

export async function allocateAirdrops(_amount) {
  const data = await instance.allocateAirdrops.request(_amount).params[0].data;
  return sendTx({ data, acc: account, accKey: key, value: 0, fn: 'allocateRewards' });
}

export async function getNonce(_account) {
  const nonce = await instance.nonceOf.call(_account);
  return nonce.toNumber();
}

export async function sign(_account, _amount) {
  const nonce = await getNonce(_account);
  const amnt = new web3.utils.BN(_amount * 10 ** 18);
  const hash = web3.utils.soliditySha3(amnt.toString(), _account, nonce);
  const sig = web3.eth.accounts.sign(hash, '0x' + key);
  return sig.signature;
}
