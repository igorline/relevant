import React, { useEffect } from 'react';
import { View, Title, BodyText, SecondaryText } from 'modules/styled/uni';
import styled from 'styled-components';
import ContractProvider, { contractPropTypes } from 'modules/contract/contract.container';
import { useTokenContract } from 'modules/contract/contract.hooks';
import { parseBN, readableMethods } from 'modules/contract/utils';
import { formatBalanceRead } from '../../web_ethTools/utils';

const ParamsTable = styled.table`
  margin-top: 10px;
  margin-left: 20px;
`;

const ContractParams = ({
  web3Status,
  web3Actions,
  cacheMethod,
  cacheEvent,
  methodCache,
  accounts,
  userBalance
}) => {
  useTokenContract(
    web3Status,
    web3Actions,
    cacheMethod,
    cacheEvent,
    accounts,
    userBalance
  );

  useEffect(() => {
    readableMethods.forEach(method => cacheMethod(method));
  }, []);

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
            {userBalance && userBalance.value
              ? formatBalanceRead(parseBN(userBalance.value).toString())
              : 'Loading...'}
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

ContractParams.propTypes = contractPropTypes;

export default ContractProvider(ContractParams);
