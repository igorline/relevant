import React, { useContext } from 'react';

export const ContractContext = React.createContext(0);

export function useContract() {
  const contract = useContext(ContractContext);
  if (contract && !contract.initialized) contract.init(true);
  return contract;
}
