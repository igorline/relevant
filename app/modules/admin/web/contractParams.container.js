import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Title, BodyText, SecondaryText } from 'modules/styled/uni';
import styled from 'styled-components';
import ContractProvider from 'modules/contract/contract.container';
import { getProvider } from 'modules/web_ethTools/utils';
import { parseBN, readableMethods } from 'modules/contract/utils';

const web3 = getProvider();

const ParamsTable = styled.table`
  margin-top: 10px;
  margin-left: 20px;
`;

const ContractParams = ({
  web3Actions,
  cacheMethod,
  methodCache,
  accounts,
  userBalance
}) => {
  useEffect(() => {
    web3Actions.init(web3);
    readableMethods.forEach(method => cacheMethod(method));
  }, []);
  useEffect(() => {
    if (accounts && accounts.length && !userBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, userBalance]);
  return (
    <View m={4}>
      <Title>Contract Params</Title>
      <View>
        <View>
          <SecondaryText>
            User address: {accounts && accounts[0] ? accounts[0] : 'Loading...'}
          </SecondaryText>
          <SecondaryText>
            User balance:{' '}
            {userBalance && userBalance.value ? parseBN(userBalance.value) : 'Loading...'}
          </SecondaryText>
          <BodyText>
            <ParamsTable>
              <tbody>
                <tr>
                  <td>Metdod</td>
                  <td>value</td>
                </tr>
                {hasCacheValue(methodCache) &&
                  readableMethods.map(method => (
                    <tr key={method}>
                      <td>{method}: </td>
                      <td>
                        {methodCache.select(method) &&
                          parseBN(methodCache.select(method).value)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </ParamsTable>
          </BodyText>
        </View>
      </View>
    </View>
  );
};

const hasCacheValue = cache => cache.select('name') && cache.select('name').value;

ContractParams.propTypes = {
  web3Actions: PropTypes.object,
  methodCache: PropTypes.object,
  cacheMethod: PropTypes.func,
  accounts: PropTypes.array,
  userBalance: PropTypes.object
};

export default ContractProvider(ContractParams);
