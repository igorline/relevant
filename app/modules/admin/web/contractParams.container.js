import React, { useEffect } from 'react';
import styled from 'styled-components';
import pickBy from 'lodash.pickby';
import { types } from 'core/contracts';
import { numbers } from 'app/utils';
import {
  View,
  Title,
  BodyText,
  SecondaryText,
  Button,
  NumericalValue
} from 'modules/styled/uni';
import ContractProvider, { contractPropTypes } from 'modules/contract/contract.container';
import { useTokenContract } from 'modules/contract/contract.hooks';
import { formatBalanceWrite, parseBN } from 'app/utils/eth';
import { Input } from 'app/modules/styled/web';

const ParamsTable = styled.table`
  margin-top: 10px;
  margin-left: 20px;
  th,
  td {
    padding: 15px;
    text-align: left;
  }
  tr:nth-child(even) {
    background-color: #f8f8f8;
  }
`;

const AdminActions = styled.div`
  max-width: 280px;
  margin-top: 10px;
`;

const rewardsToAllocate = formatBalanceWrite('999', 18);
const readableMethods = getReadableMethods();

const ContractParams = ({ ethState, ethActions }) => {
  const [accounts, { userBalance, methodCache }, tokenActions] = useTokenContract(
    ethState,
    ethActions
  );

  useEffect(() => {
    readableMethods.forEach(method => tokenActions.cacheMethod(method));
  }, []);

  const releaseTokens = () =>
    tokenActions.cacheSend('releaseTokens', { from: accounts[0] });
  const allocateRewards = () =>
    tokenActions.cacheSend('allocateRewards', { from: accounts[0] }, rewardsToAllocate);

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
              ? parseBN(userBalance.value).toString()
              : 'Loading...'}
          </SecondaryText>
          <BodyText>
            <ParamsTable>
              <tr>
                <th>Method</th>
                <th>Value</th>
              </tr>
              <tbody>
                {hasCacheValue(methodCache) &&
                  readableMethods.map(method => (
                    <tr key={method}>
                      <td>{method}</td>
                      <td>
                        <NumericalValue>
                          {methodCache.select(method) &&
                          typeof parseBN(methodCache.select(method).value) !== 'number'
                            ? parseBN(methodCache.select(method).value)
                            : numbers.abbreviateNumber(
                              parseBN(methodCache.select(method).value)
                            )}
                        </NumericalValue>
                      </td>
                      <td>
                        <Button onClick={() => tokenActions.cacheMethod(method)}>
                          Call
                        </Button>
                      </td>
                      <td>
                        <Input />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </ParamsTable>
          </BodyText>
          {accounts && accounts[0] && (
            <AdminActions>
              <Button mr={'auto'} mt={4} onClick={() => releaseTokens()}>
                Release Tokens
              </Button>
              <Button mr={'auto'} mt={4} onClick={() => allocateRewards()}>
                Allocate Rewards
              </Button>
            </AdminActions>
          )}
        </View>
      </View>
    </View>
  );
};

ContractParams.propTypes = contractPropTypes;

export default ContractProvider(ContractParams);

// Utils
function hasCacheValue(cache) {
  return cache.select('name') && cache.select('name').value;
}

function getReadableMethods() {
  return Object.keys(
    pickBy(
      types.methods,
      (_, method) =>
        !types.methods[method].send &&
        method !== 'balanceOf' &&
        method !== 'isMinter' &&
        method !== 'allowance' &&
        method !== 'partialSum' &&
        method !== 'nonceOf' &&
        method !== 'isOwner' &&
        method !== 'currentRound'
    )
  );
}
