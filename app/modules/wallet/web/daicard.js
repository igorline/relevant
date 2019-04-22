/* eslint-disable */
import { getConnextClient } from 'connext/dist/Connext.js';
import Web3 from 'web3';
import ProviderOptions from 'app/utils/connext/connextUtils';
import clientProvider from 'app/utils/connext/clientProvider';

async function setWeb3(rpc) {
  let rpcUrl;
  let hubUrl;

  // SET RPC
  switch (rpc) {
    case 'LOCALHOST':
      rpcUrl = localProvider;
      hubUrl = hubUrlLocal;
      break;
    case 'RINKEBY':
      rpcUrl = rinkebyProvider;
      hubUrl = hubUrlRinkeby;
      break;
    case 'MAINNET':
      rpcUrl = mainnetProvider;
      hubUrl = hubUrlMainnet;
      break;
    default:
      throw new Error(`Unrecognized rpc: ${rpc}`);
  }
  console.log('Custom provider with rpc:', rpcUrl);

  // Ask permission to view accounts
  let windowId;
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    windowId = await window.web3.eth.net.getId();
  }

  // Set provider options to current RPC
  const providerOpts = new ProviderOptions(rpcUrl).approving();

  // Create provider
  const provider = clientProvider(providerOpts);

  // Instantiate Web3 using provider
  const customWeb3 = new Web3(provider);

  // Get network ID to set guardrails
  const customId = await customWeb3.eth.net.getId();

  // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext
  this.setState({ customWeb3, hubUrl });
  if (windowId && windowId !== customId) {
    // eslint-disable-next-line
    alert(
      `Your card is set to ${JSON.stringify(
        rpc
      )}. To avoid losing funds, please make sure your metamask and card are using the same network.`
    );
  }
}

async function setConnext() {
  const { address, customWeb3, hubUrl } = this.state;

  const opts = {
    web3: customWeb3,
    hubUrl, // url of hub,
    user: address
  };
  console.log('Setting up connext with opts:', opts);

  // *** Instantiate the connext client ***
  const connext = await getConnextClient(opts);
  console.log('Successfully set up connext! Connext config:');
  console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
  console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
  console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
  console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);
  this.setState({
    connext,
    tokenAddress: connext.opts.tokenAddress,
    channelManagerAddress: connext.opts.contractAddress,
    hubWalletAddress: connext.opts.hubAddress,
    ethNetworkId: connext.opts.ethNetworkId
  });
}
