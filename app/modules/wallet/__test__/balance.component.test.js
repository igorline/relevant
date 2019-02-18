import React from 'react';
import renderer from 'react-test-renderer';
import Balance from 'modules/wallet/balance.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { user } from 'app/mockdata';

// jest.mock('modules/listview/web/infScroll.component', (props) => <div> {props.children}</div>);
jest.mock('modules/wallet/earnings.component', () => 'Earnings');

const props = {
  user: user.user1,
  contract: {},
  actions: {},
  wallet: {}
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
