import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import { injectSaga } from 'redux-sagas-injector';
import { ReactReduxContext } from 'react-redux';
import { ContractContext } from './contract.context';

const contract = loadable(() => import('./setupStatesauce'));

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
      const { instance: _instance, web3Sagas, web3Reducers } = await contract.load();
      const { saga, reducer } = _instance;
      injectSaga('RelevantToken', saga);
      injectSaga('web3Sagas', web3Sagas);
      store.injectReducer('RelevantToken', reducer.RelevantToken);
      store.injectReducer('web3', web3Reducers);
      setInstance(_instance);
      setInitialized(true);
    }
    shouldInit && initialize();
  }, [shouldInit, store]);

  const { actions, tokenAddress, selectors, types } = instance;

  return (
    <ContractContext.Provider
      value={{
        initialized,
        actions,
        types,
        tokenAddress,
        selectors,
        init
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}
