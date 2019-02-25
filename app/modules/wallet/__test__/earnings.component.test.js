import React from 'react';
import renderer from 'react-test-renderer';
import Earning from 'modules/wallet/earning.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { earnings } from 'app/mockdata';

const props = {
  earning: earnings.earningPaidout,
  payout: 10,
  month: 'February'
};

test('Snapshot Paidout Web', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <Earning {...props} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});

const propsPending = {
  earning: earnings.earningPending1,
  payout: 10,
  month: 'February'
};

test('Snapshot Pending Web', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <Earning {...propsPending} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});
