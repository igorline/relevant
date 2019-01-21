import React from 'react';
import renderer from 'react-test-renderer';
import { Profile } from 'modules/profile/web/profile.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, user1, usersState } from 'app/utils/testData';

const props = {
  actions: { logout: jest.fn() },
  usersState,
  auth,
  match: { params: { id: user1.handle } }
};

test('Snapshot Profile Web', () => {
  const tree = renderer.create(
    <MemoryRouter><Profile {...props} /></MemoryRouter>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
