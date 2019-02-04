import React from 'react';
import renderer from 'react-test-renderer';
import { Profile } from 'modules/profile/profile.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth } from 'app/mockdata';

const props = {
  user: auth.auth.user,
  actions: {},
};

test('Snapshot own Profile', () => {
  const tree = renderer.create(
    <MemoryRouter>
      <Profile {...props} isOwner />
    </MemoryRouter>).toJSON();
  expect(tree).toMatchSnapshot();
});

test('Snapshot other users Profile', () => {
  const tree = renderer.create(
    <MemoryRouter>
      <Profile {...props} />
    </MemoryRouter>).toJSON();
  expect(tree).toMatchSnapshot();
});
