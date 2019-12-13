import React, { useEffect, Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import pickBy from 'lodash/pickBy';
import { abbreviateNumber } from 'app/utils/numbers';
import {
  View,
  Title,
  BodyText,
  SecondaryText,
  Button,
  NumericalValue
} from 'modules/styled/uni';
import { useRelevantToken } from 'modules/contract/contract.hooks';
import { formatBalanceWrite, parseBN } from 'app/utils/eth';
import { Input } from 'app/modules/styled/web';
import Test from 'modules/profile/apollo.demo';
import { useContract } from 'modules/contract/contract.context';
import Treasury from './treasury';

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

export default function TokenPanel() {
  return (
    <Fragment>
      <Treasury />
      <Test />
      <ContractParams />
    </Fragment>
  );
}

function ContractParams() {
  const { userBalance, accounts, send, call, getState } = useRelevantToken();
  const { types, initialized } = useContract();
  const readableMethods = types ? getReadableMethods(types) : [];
  const [allocateAmount, setAllocateAmount] = useState();

  useEffect(() => {
    if (!initialized) return;
    call && readableMethods.forEach(method => call(method));
  }, [call, initialized]); // eslint-disable-line

  const releaseTokens = () => send('releaseTokens', { from: accounts[0] });
  const allocateRewards = () =>
    send(
      'allocateRewards',
      { from: accounts[0] },
      formatBalanceWrite(allocateAmount, 18)
    );

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
              <View mt={4} fdirection="row" align={'flex-start'}>
                <Input
                  mt={'0'}
                  p={1.7}
                  type="text"
                  value={allocateAmount}
                  onChange={e => setAllocateAmount(e.target.value)}
                />
                <Button mr={'auto'} onClick={() => allocateRewards()}>
                  Allocate Rewards
                </Button>
              </View>
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
                {hasValue(getState) &&
                  readableMethods.map(method => (
                    <ParamRow
                      key={method}
                      method={method}
                      getState={getState}
                      call={call}
                    />
                  ))}
              </tbody>
            </ParamsTable>
          </BodyText>
        </View>
      </View>
    </View>
  );
}

ParamRow.propTypes = {
  method: PropTypes.string,
  getState: PropTypes.func,
  call: PropTypes.func
};

function ParamRow({ method, call, getState }) {
  return (
    <tr>
      <td>{method}</td>
      <td>
        <NumericalValue>{abbreviateNumber(getState(method).value)}</NumericalValue>
      </td>
      <td>
        <Button onClick={() => call(method)}>Call</Button>
      </td>
      <td>
        <Input />
      </td>
    </tr>
  );
}

// Utils
function hasValue(state) {
  return state && state('name') && state('name').value;
}

function getReadableMethods(types) {
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
          method !== 'currentRound' &&
          method !== 'initializeRewardSplit' &&
          method !== 'airdropSwitchRound'
      )
    )
  );
}
