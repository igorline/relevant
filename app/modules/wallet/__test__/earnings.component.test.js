import React from 'react';
import renderer from 'react-test-renderer';
import { Earnings } from 'modules/wallet/earnings.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { earnings } from 'app/mockdata';

jest.mock('modules/listview/web/infScroll.component', () => 'infScroll');

const props = {
  pageSize: 10,
  earnings: earnings.earnings
};

test('Snapshot Post Web', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <Earnings {...props} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});
