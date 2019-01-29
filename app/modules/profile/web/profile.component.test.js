import React from 'react';
import renderer from 'react-test-renderer';
import ProfileComponent from 'modules/profile/web/profile.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { user } from 'app/mockdata';

const props = {
  actions: { logout: jest.fn() },
  user: user.user1,
  isOwner: false,
};

test('Snapshot Profile Web', () => {
  const tree = renderer.create(
    <MemoryRouter><ProfileComponent {...props} /></MemoryRouter>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
