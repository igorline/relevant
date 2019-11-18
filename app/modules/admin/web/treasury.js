import React, { useEffect } from 'react';
import { View, BodyText, NumericalValue } from 'modules/styled/uni';
import { useRelevantToken } from 'modules/contract/contract.hooks';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { colors } from 'styles';

const contractParams = [
  'totalReleased',
  'allocatedRewards',
  'rewardFund',
  'airdropFund',
  'allocatedAirdrops'
];

const tableData = [
  { label: 'Total Released Tokens', contract: 'totalReleased' },
  { label: 'Curation Reward Fund', contract: 'rewardFund', db: 'rewardFund' },
  {
    label: 'Allocated Curation Rewards',
    contract: 'allocatedRewards',
    db: 'curationRewards'
  },
  { label: 'Earnings', db: 'earned' },
  { label: 'Airdrop Fund', contract: 'airdropFund' },
  { label: 'Allocated Airdrops', contract: 'allocatedAirdrops', db: 'airdrop' }
];

const GET_TREASURY = gql`
  query {
    distributedTokens {
      balance
      legacyTokens
      airdropTokens
      cashedOut
      curationRewards
      airdrop
      earned
      rewardFund
    }
  }
`;

export default function Treasury() {
  const { data, loading, error } = useQuery(GET_TREASURY);
  const { getState, call } = useRelevantToken();

  useEffect(() => {
    call && contractParams.forEach(method => call(method));
  }, [call]);

  if (loading) return <BodyText>Loading...</BodyText>;
  if (error) return <BodyText>ERROR: {error.message}</BodyText>;
  return (
    <View m={[4, 2]} maxWidth={75} border={colors.lightGrey}>
      <View p={1} fdirection={'row'}>
        <NumericalValue br={colors.lightGrey} mr={1} flex={1}>
          contract
        </NumericalValue>
        <NumericalValue br={colors.lightGrey} mr={1} flex={1}>
          db
        </NumericalValue>
        <NumericalValue flex={1} pl={1}>
          difference
        </NumericalValue>
      </View>
      {tableData.map((row, i) => (
        <View key={i}>
          <BodyText p={1} bg={colors.lightGrey}>
            {row.label}
          </BodyText>
          <View p={1} fdirection={'row'}>
            <BodyText br={colors.lightGrey} mr={1} flex={1}>
              {getState(row.contract).value && getState(row.contract).value / 1e18}
            </BodyText>
            <BodyText br={colors.lightGrey} mr={1} flex={1}>
              {data.distributedTokens[row.db]}
            </BodyText>
            <BodyText flex={1}>
              {row.contract && row.db
                ? (
                    getState(row.contract).value / 1e18 -
                    data.distributedTokens[row.db]
                  ).toString()
                : ''}
            </BodyText>
          </View>
        </View>
      ))}
    </View>
  );
}
