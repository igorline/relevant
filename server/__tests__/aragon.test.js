/* eslint no-console: 0 */
import AragonWrapper, {
  // providers,
  ensResolve
  // resolveAddressIdentity
} from '@aragon/wrapper';

const MAINNET_REGISTRY = '0x314159265dd8dbb310642f98f50c066173c1259b';

const DAO = '0x0ee165029b09d91a54687041adbc705f6376c67f';

const aragon = new AragonWrapper(DAO, {
  provider: 'wss://mainnet.eth.aragon.network/ws',
  apm: {
    ensRegistryAddress: MAINNET_REGISTRY,
    ipfs: {
      gateway: 'https://ipfs.eth.aragon.network/ipfs'
    }
  }
});

async function init() {
  // Initialises the wrapper
  await aragon.init();
}

describe('aragon', () => {
  it('connect', async () => {
    await init();

    // const md = await aragon.getProxyValues();
    // const ns = await aragon.aclProxy.contract.methods.appId().call();
    // console.log(ns);
    // console.log(aragon.aclProxy.contract);
    console.log(aragon);

    const address = await ensResolve('brightid.aragonid.eth', {
      provider: aragon.web3.currentProvider,
      registryAddress: MAINNET_REGISTRY
    });
    console.log('address', address);

    const id = await aragon.resolveAddressIdentity(DAO);
    console.log(id);

    // console.log(md);
    // await _request(options, getStore);
    // expect(test).toMatchSnapshot();
    // expect(test).toBeCalled();
  });
});
