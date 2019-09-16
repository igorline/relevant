import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import pickBy from 'lodash/pickBy';
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
import { contractPropTypes } from 'modules/contract/contract.container';
import { useTokenContract, useRelevantActions } from 'modules/contract/contract.hooks';
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

const ParamRow = ({ method, methodCache, cacheMethod }) => (
  <tr>
    <td>{method}</td>
    <td>
      <NumericalValue>
        {methodCache.select(method) &&
        typeof parseBN(methodCache.select(method).value) !== 'number'
          ? parseBN(methodCache.select(method).value)
          : numbers.abbreviateNumber(parseBN(methodCache.select(method).value))}
      </NumericalValue>
    </td>
    <td>
      <Button onClick={() => cacheMethod(method)}>Call</Button>
    </td>
    <td>
      <Input />
    </td>
  </tr>
);

ParamRow.propTypes = {
  method: PropTypes.string,
  methodCache: PropTypes.shape({
    select: PropTypes.func
  }),
  cacheMethod: PropTypes.func
};

const ContractParams = () => {
  const [accounts, { userBalance, methodCache }] = useTokenContract();
  const { cacheMethod, cacheSend } = useRelevantActions();

  useEffect(() => {
    readableMethods.forEach(method => cacheMethod(method));
  }, [cacheMethod]);

  const releaseTokens = () => cacheSend('releaseTokens', { from: accounts[0] });
  const allocateRewards = () =>
    cacheSend('allocateRewards', { from: accounts[0] }, rewardsToAllocate);

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
          <BodyText>
            <ParamsTable>
              <tbody>
                <tr>
                  <th>Method</th>
                  <th>Value</th>
                </tr>
              </tbody>
              <tbody>
                {hasCacheValue(methodCache) &&
                  readableMethods.map(method => (
                    <ParamRow
                      key={method}
                      method={method}
                      methodCache={methodCache}
                      cacheMethod={cacheMethod}
                    />
                  ))}
              </tbody>
            </ParamsTable>
          </BodyText>
        </View>
      </View>
    </View>
  );
};

ContractParams.propTypes = contractPropTypes;

export default ContractParams;

// Utils
function hasCacheValue(cache) {
  return cache.select('name') && cache.select('name').value;
}

function getReadableMethods() {
  return ['allocatedRewards', 'totalReleased'].concat(
    Object.keys(
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
          method !== 'allocatedRewards' &&
          method !== 'totalReleased' &&
          method !== 'currentRound'
      )
    )
  );
}
