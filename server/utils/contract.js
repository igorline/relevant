import { Contract, ethers } from 'ethers';

const erc20abi = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256'
      }
    ],
    payable: false,
    type: 'function'
  }
];

export const getTokenBalance = async ({ address, tokenAddress }) => {
  const provider = ethers.getDefaultProvider('mainnet');
  const contract = new Contract(tokenAddress, erc20abi, provider);
  const balance = await contract.balanceOf(address);
  return balance.toString();
};
