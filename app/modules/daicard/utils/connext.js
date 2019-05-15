/* eslint no-console: 0 */
import * as Connext from 'connext';
import interval from 'interval-promise';
import * as eth from 'ethers';
import { localStorage } from 'app/utils/storage';

const tokenAbi = require('./../abi/humanToken.json');

const { Big, minBN } = Connext.big;
const { CurrencyType, CurrencyConvertable } = Connext.types;
const { getExchangeRates, hasPendingOps } = new Connext.Utils();

const hubUrlRinkeby = 'https://rinkeby.hub.connext.network/api/hub';
const hubUrlMainnet = 'https://hub.connext.network/api/hub';

// Constants for channel max/min - this is also enforced on the hub
export const DEPOSIT_ESTIMATED_GAS = Big('700000'); // 700k gas
export const HUB_EXCHANGE_CEILING = eth.constants.WeiPerEther.mul(Big(69)); // 69 TST
export const CHANNEL_DEPOSIT_MAX = eth.constants.WeiPerEther.mul(Big(30)); // 30 TST
export const MAX_GAS_PRICE = Big('20000000000'); // 20 gWei

const RPC = 'RINKEBY';

let state = {
  isInitialized: null,
  connext: null,
  browserMinimumBalance: null,
  customWeb3: null,
  tokenContract: null,
  address: null,
  hubUrl: null
};

let updateReduxState;

export async function initConnext({ updateState, reinit }) {
  try {
    if (state.isInitialized && !reinit) return state.connext;
    updateReduxState = updateState;
    setState({ isInitialized: false });

    let mnemonic = localStorage.getItem('mnemonic');
    if (!mnemonic) {
      mnemonic = eth.Wallet.createRandom().mnemonic;
      localStorage.setItem('mnemonic', mnemonic);
    }

    await setConnext({ mnemonic });
    await setTokenContract();
    addConnextHandler();
    poller();

    setState({ isInitialized: true });

    console.log(state);
    return state.connext;
  } catch (err) {
    return null;
    console.log(err); // eslint-disable-line
  }
}

function setState(newState) {
  state = {
    ...state,
    ...newState
  };
  updateReduxState(newState);
}

async function setConnext({ rpc, mnemonic }) {
  let ethprovider;
  let hubUrl;

  switch (RPC) {
    // case 'LOCALHOST':
    //   ethprovider = localProvider;
    //   hubUrl = hubUrlLocal;
    //   break;
    case 'RINKEBY':
      ethprovider = new eth.getDefaultProvider('rinkeby'); // eslint-disable-line
      hubUrl = hubUrlRinkeby;
      break;
    case 'MAINNET':
      hubUrl = hubUrlMainnet;
      ethprovider = new eth.getDefaultProvider(); // eslint-disable-line
      break;
    default:
      throw new Error(`Unrecognized rpc: ${rpc}`);
  }

  const opts = {
    hubUrl,
    mnemonic
  };

  // *** Instantiate the connext client ***
  const connext = await Connext.getConnextClient(opts);

  const address = await connext.wallet.getAddress();

  console.log('Successfully set up connext! Connext config:');
  console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
  console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
  console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
  console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);

  return setState({
    connext,
    tokenAddress: connext.opts.tokenAddress,
    channelManagerAddress: connext.opts.contractAddress,
    hubWalletAddress: connext.opts.hubAddress,
    ethNetworkId: connext.opts.ethNetworkId,
    address,
    ethprovider
  });
}

function addConnextHandler() {
  const { connext } = state;
  let { browserMinimumBalance } = state;
  connext.on('onStateChange', async connextState => {
    try {
      console.log('Connext state changed:', connextState);
      setState({
        connextState,
        channelState: connextState.persistent.channel,
        runtime: connextState.runtime,
        exchangeRate: connextState.runtime.exchangeRate
          ? connextState.runtime.exchangeRate.rates.USD
          : 0
      });
      if (!browserMinimumBalance) {
        browserMinimumBalance = await setBrowserWalletMinimumBalance();
        setState({ browserMinimumBalance });
      }
      // checkStatus();
    } catch (err) {
      console.log(err);
    }
  });
}

async function setBrowserWalletMinimumBalance() {
  const { connextState, ethprovider } = state;
  const gasEstimateJson = await eth.utils.fetchJson({
    url: 'https://ethgasstation.info/json/ethgasAPI.json'
  });
  const providerGasPrice = await ethprovider.getGasPrice();
  // multiply gas price by two to be safe
  let currentGasPrice = Math.round((gasEstimateJson.average / 10) * 2);
  // dont let gas price be any higher than the max
  currentGasPrice = eth.utils.parseUnits(
    minBN(Big(currentGasPrice.toString()), MAX_GAS_PRICE).toString(),
    'gwei'
  );
  // unless it really needs to be: average eth gas station price w ethprovider's
  currentGasPrice = currentGasPrice.add(providerGasPrice).div(eth.constants.Two);
  console.log(`Gas Price = ${currentGasPrice}`);

  // default connext multiple is 1.5, leave 2x for safety
  const totalDepositGasWei = DEPOSIT_ESTIMATED_GAS.mul(Big(2)).mul(currentGasPrice);

  // add dai conversion
  const minConvertable = new CurrencyConvertable(
    CurrencyType.WEI,
    totalDepositGasWei,
    () => getExchangeRates(connextState)
  );
  const browserMinimumBalance = {
    wei: minConvertable.toWEI().amount,
    dai: minConvertable.toUSD().amount
  };
  setState({ browserMinimumBalance });
  return browserMinimumBalance;
}

async function setTokenContract() {
  try {
    const { tokenAddress, ethprovider } = state;
    const tokenContract = new eth.Contract(tokenAddress, tokenAbi, ethprovider);
    return setState({ tokenContract });
  } catch (e) {
    console.log('Error setting token contract');
    return console.log(e);
  }
}

async function poller() {
  await autoDeposit();
  await autoSwap();
  interval(async () => autoDeposit(), 5000);
  interval(async () => autoSwap(), 1000);
}

async function autoDeposit() {
  const {
    address,
    tokenContract,
    connextState,
    tokenAddress,
    connext,
    browserMinimumBalance,
    ethprovider
  } = state;

  if (!connext || !browserMinimumBalance) return;

  const balance = await ethprovider.getBalance(address);

  let tokenBalance = '0';
  try {
    tokenBalance = await tokenContract.balanceOf(address);
  } catch (e) {
    console.warn(
      `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${JSON.stringify(
        await ethprovider.getNetwork()
      )}))? Error: ${e.message}`
    );
    return;
  }

  if (balance.gt('0') || tokenBalance.gt('0')) {
    const minWei = Big(browserMinimumBalance.wei);
    if (Big(balance).lt(minWei)) {
      // don't autodeposit anything under the threshold
      // update the refunding variable before returning
      // We hit this repeatedly after first deposit & we have dust left over
      // No need to clutter logs w the below
      // console.log(`Current balance is ${balance.toString()},
      // less than minBalance of ${minWei.toString()}`);
      return;
    }
    // only proceed with deposit request if you can deposit
    if (!connextState) {
      return;
    }
    if (
      // something was submitted
      connextState.runtime.deposit.submitted ||
      connextState.runtime.withdrawal.submitted ||
      connextState.runtime.collateral.submitted
    ) {
      console.log('Deposit or withdrawal transaction in progress, will not auto-deposit');
      return;
    }

    const channelDeposit = {
      amountWei: Big(balance).sub(minWei),
      amountToken: tokenBalance
    };

    if (channelDeposit.amountWei === '0' && channelDeposit.amountToken === '0') {
      return;
    }

    await state.connext.deposit({ amountWei: channelDeposit.amountWei.toString() });
  }
}

async function autoSwap() {
  const { channelState, connextState } = state;
  if (!connextState || hasPendingOps(channelState)) {
    return;
  }
  const weiBalance = Big(channelState.balanceWeiUser);
  const tokenBalance = Big(channelState.balanceTokenUser);
  if (channelState && weiBalance.gt(Big('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
    await state.connext.exchange(channelState.balanceWeiUser, 'wei');
  }
}
