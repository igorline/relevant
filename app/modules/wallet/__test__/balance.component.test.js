import React from 'react';
import renderer from 'react-test-renderer';
import Balance from 'modules/wallet/balance.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { user } from 'app/mockdata';

const props = {
  user: user.user1,
  contract: {},
  actions: {},
  wallet: {},
  isWeb: true
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
