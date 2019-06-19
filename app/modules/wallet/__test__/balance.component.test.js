import React from 'react';
import renderer from 'react-test-renderer';
import { Balance } from 'modules/wallet/balance.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { user } from 'app/mockdata';

const props = {
  user: user.user1,
  contract: {},
  actions: {},
  wallet: {},
  isWeb: true,

  // web3 props
  web3Status: {},
  web3Actions: {
    init: () => null
  },
  cacheEvent: () => null
};

test('Snapshot Balance Web', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <Balance {...props} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});
