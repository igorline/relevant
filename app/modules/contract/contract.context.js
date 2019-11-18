import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import { injectSaga } from 'redux-sagas-injector';
import { ReactReduxContext } from 'react-redux';

const contract = loadable(() => import('app/core/contracts'));

export const ContractContext = React.createContext(0);

export function useContract() {
  const contractData = useContext(ContractContext);
  if (!contractData.initialized) contractData.init(true);
  return contractData;
}

ContractProvider.propTypes = {
  children: PropTypes.node
};

export function ContractProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [shouldInit, init] = useState(false);
  const [instance, setInstance] = useState({});

  const { store } = useContext(ReactReduxContext);

  useEffect(() => {
    async function initialize() {
      const { instance: _instance } = await contract.load();
      const { saga, reducer } = _instance;
      injectSaga('RelevantToken', saga);
      store.injectReducer('RelevantToken', reducer.RelevantToken);
      setInstance(_instance);
      setInitialized(true);
    }
    shouldInit && initialize();
  }, [shouldInit, store]);

  const { actions, tokenAddress, selectors } = instance;

  return (
    <ContractContext.Provider
      value={{
        initialized,
        actions,
        tokenAddress,
        selectors,
        init
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}
