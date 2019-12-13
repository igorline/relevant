import { ethers } from 'ethers';
import RelevantTokent from 'app/contracts/RelevantToken';
import ganache from 'ganache-cli';
import BN from 'bignumber.js';

require('dotenv').config();

const key = process.env.TEST_KEY;

export const provider = new ethers.providers.Web3Provider(
  ganache.provider({
    network_id: 99,
    accounts: [
      {
        secretKey: '0x' + key,
        balance: 99e18
      }
    ]
  })
);

const wallet = new ethers.Wallet(key, provider);

export async function deployContract() {
  try {
    const factory = new ethers.ContractFactory(
      RelevantTokent.abi,
      RelevantTokent.bytecode,
      wallet
    );

    const contract = await factory.deploy();

    await contract.deployed();
    await initContract(contract);
    console.log('CONTRACT_ADDRESS', contract.address); // eslint-disable-line
    return { address: contract.address, provider };
  } catch (err) {
    console.log('failed to deploy contract', err); // eslint-disable-line
    return null;
  }
}

async function initContract(contract) {
  const testName = 'Relevant Token';
  const testDecimals = 18;
  const p = 1e18;
  const testSymbol = 'REL';
  const testVersion = '1.0';
  const testDevFundAddress = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';
  const halfLife = 8760; // # of rounds to decay by half
  const timeConstant = (halfLife / Math.LN2) * p;
  const targetInflation = 10880216701148;
  const initRoundReward = 2500 * p;
  const roundLength = 1; // 240;
  const roundDecay = 999920876739935000;
  const targetRound = 26704;
  const totalPremint = 27777044629743800000000000;

  const airdropSwitchRound = 8352;
  const airdropRoundDecay = 999762649000782000;
  const firstNewAirdrop = 3442799625893100000000;

  // transform big number parameters for contract initialization
  // (ugh is there a better way to do this?)

  const airdropRoundDecayBNString = new BN(airdropRoundDecay.toString())
    .toFixed(0)
    .toString();
  const firstNewAirdropBNString = new BN(firstNewAirdrop.toString())
    .toFixed(0)
    .toString();

  const initRoundRewardBNString = new BN(initRoundReward.toString())
    .toFixed(0)
    .toString();
  const timeConstantBNString = new BN(timeConstant.toString()).toFixed(0).toString();
  const totalPremintBNString = new BN(totalPremint.toString()).toFixed(0).toString();
  const roundDecayBNString = new BN(roundDecay.toString()).toFixed(0).toString();

  await contract.initialize(
    testName,
    testDecimals,
    testSymbol,
    testVersion,
    testDevFundAddress,
    initRoundRewardBNString,
    timeConstantBNString,
    targetInflation,
    targetRound,
    roundLength,
    roundDecayBNString,
    totalPremintBNString
  );

  await contract.initializeRewardSplit(
    airdropSwitchRound,
    airdropRoundDecayBNString,
    firstNewAirdropBNString
  ); // feature was added in contract upgrade

  return contract;
}
