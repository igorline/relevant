import React from 'react';
import renderer from 'react-test-renderer';
import { Balance } from 'modules/wallet/balance.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

jest.mock('modules/contract/contract.hooks', () => {
  return {
    useTokenContract: () => null,
    useBalance: () => ({ phase: 'SUCCESS', value: 10 })
  };
});

jest.mock('react-redux', () => {
  const { user } = require('app/mockdata');
  const state = {
    auth: { user: user.user1 },
    navigation: { screenSize: 0 }
  };

  return {
    useDispatch: () => {},
    useSelector: fn => fn(state)
  };
});

const props = {
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
