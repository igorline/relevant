import Tx from 'ethereumjs-tx';
import { Buffer } from 'buffer';
import { localStorage } from 'app/utils/storage';
// import { getStore } from './walletGen';
// import store from '../App';

const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

// require('dotenv').config();

export type ApproveTransactionCallback = (
  error: string | null,
  isApproved?: boolean
) => void;

export type ApproveSignCallback = (error: string | null, rawMsgSig?: string) => void;

export default class ProviderOptions {
  rpcUrl: string | undefined;
  hubUrl: string | undefined;

  constructor(store: any, rpcUrl: string, hubUrl: string) {
    this.store = store;
    this.rpcUrl = rpcUrl;
    this.hubUrl = hubUrl;
  }

  getAccounts = (callback: (err: string | null, accounts?: string[]) => void) => {
    // const state = this.store.getState();
    const addr = localStorage ? localStorage.getItem('addressString') : null;
    // const addr = state[0] ? state[0].getAddressString() : null;
    callback(null, addr ? [addr] : []);
  };

  approveTransactionAlways = (txParams: any, callback: ApproveTransactionCallback) => {
    callback(null, true);
  };

  signTransaction = (rawTx: any, callback: ApproveSignCallback) => {
    const key = this.getPrivateKey();

    if (!key) {
      return callback('Wallet is locked.');
    }

    const tx = new Tx(rawTx);
    tx.sign(key);
    const txHex = '0x' + Buffer.from(tx.serialize()).toString('hex');
    return callback(null, txHex);
  };

  signMessageAlways = (messageParams: any, callback: ApproveSignCallback) => {
    const key = this.getPrivateKey();

    if (!key) {
      return callback('Wallet is locked.');
    }

    const msg = messageParams.data;

    const hashBuf = Buffer.from(msg.split('x')[1], 'hex');
    const prefix = Buffer.from('\x19Ethereum Signed Message:\n');
    const buf = Buffer.concat([prefix, Buffer.from(String(hashBuf.length)), hashBuf]);

    const data = ethUtil.sha3(buf);
    const msgSig = ethUtil.ecsign(data, key);
    const rawMsgSig = ethUtil.bufferToHex(
      sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
    );
    return callback(null, rawMsgSig);
  };

  approving = () => ({
    static: {
      eth_syncing: false,
      web3_clientVersion: `LiteratePayments/v${1.0}`
    },
    rpcUrl: this.rpcUrl,
    hubUrl: this.hubUrl,
    getAccounts: this.getAccounts,
    approveTransaction: this.approveTransactionAlways,
    signTransaction: this.signTransaction,
    signMessage: this.signMessageAlways,
    signPersonalMessage: this.signMessageAlways
  });

  // likely needs updates
  getPrivateKey = (): Buffer | null =>
    localStorage ? localStorage.getItem('getPrivateKey') : null;
  // const state = this.store.getState();
  // return state[0] ? state[0].getPrivateKey() : null;
  // };

  getPublicKey = (): String | null =>
    localStorage ? localStorage.getItem('getPrivateKey') : null;
  // const state = this.store.getState();
  // return state[0] ? state[0].getAddressString() : null;
  // };
}
