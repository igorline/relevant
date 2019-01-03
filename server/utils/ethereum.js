import Web3 from 'web3';
import contract from 'truffle-contract';
import EthereumTx from 'ethereumjs-tx';

const contractData = require('../../app/contracts/RelevantCoin.json');

const RelevantCoin = contract(contractData);

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

export function isInitialized() {
  return initialized;
}

export async function init() {
  try {
    let rpcUrl = `https://${process.env.INFURA_NETWORK}.infura.io/${
      process.env.INFURA_API_KEY
    }`;

    key = process.env.OWNER_KEY;
    account = process.env.OWNER_ACC;

    if (process.env.NODE_ENV === 'test') {
      rpcUrl = 'http://localhost:7545';
      key = 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
      account = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    }

    const provider = new Web3.providers.HttpProvider(rpcUrl);
    RelevantCoin.setProvider(provider);

    web3 = new Web3(provider);

    fixTruffleContractCompatibilityIssue(RelevantCoin);
    instance = await RelevantCoin.deployed();
    decimals = await instance.decimals.call();
    decimals = decimals.toNumber();
    initialized = true;
    return true;
  } catch (err) {
    throw err;
  }
}

export async function getBalance(address) {
  const balance = await instance.balanceOf.call(address);
  return balance.div(10 ** decimals).toNumber();
}

export async function getParam(param, opt) {
  let value = await instance[param].call();
  if (!opt || !opt.noConvert) value = value.div(10 ** decimals);
  if (!opt || !opt.string) value = value.toNumber();
  return value;
}

async function sendTx(params) {
  try {
    const { acc, accKey, value, data, fn } = params;
    const nonce = await web3.eth.getTransactionCount(acc);

    // hack to update nonce, but could still fail
    // nonce = Math.max(nonce, nextNonce);
    // nextNonce = nonce + 1;
    const pk = Buffer.from(accKey, 'hex');

    const txParams = {
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

export async function buyTokens(acc, accKey, _value) {
  const value = web3.utils.toWei(_value.toString(), 'ether');
  const { data } = instance.buy.request().params[0];
  return sendTx({ data, acc, accKey, value, fn: 'buyTokens' });
}

export async function mintRewardTokens() {
  if (!instance) await init();
  const lastMint = await instance.intervalsSinceLastInflationUpdate.call();
  if (lastMint.toNumber() === 0) return null;
  const { data } = instance.mintRewardTokens.request().params[0];
  return sendTx({ data, acc: account, accKey: key, value: 0, fn: 'mintTokens' });
}

export async function allocateRewards(_amount) {
  const data = await instance.allocateRewards.request(_amount).params[0].data;
  return sendTx({ data, acc: account, accKey: key, value: 0, fn: 'allocateRewards' });
}

export async function getNonce(_account) {
  const nonce = await instance.nonceOf.call(_account);
  return nonce.toNumber();
}

export async function sign(_account, _amount) {
  const nonce = await getNonce(_account);
  let amnt = new web3.utils.BN(_amount.toString());
  let mult = new web3.utils.BN(10 ** (decimals / 2));
  mult = mult.mul(mult);
  amnt = amnt.mul(mult);
  const hash = web3.utils.soliditySha3(amnt, _account, nonce);
  const sig = web3.eth.accounts.sign(hash, '0x' + key);
  return sig.signature;
}
