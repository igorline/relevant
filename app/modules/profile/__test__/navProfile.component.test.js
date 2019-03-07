import React from 'react';
import renderer from 'react-test-renderer';
import { NavProfile } from 'modules/profile/navProfile.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, earnings } from 'app/mockdata';

const props = {
  earnings: earnings.earnings,
  user: auth.auth.user
};

test('Snapshot NavProfile', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <NavProfile {...props} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});
