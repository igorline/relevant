import React from 'react';
import renderer from 'react-test-renderer';
import AvatarBoxWeb from 'modules/user/web/avatarbox.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

const user = { _id: 123, handle: 'handle', name: 'Name', relevance: { pagerank: 10 } };
const date = new Date();

const props = {
  user,
  date,
  relevance: false,
  setSelected: jest.fn()
};

test('Snapshot AvatarBox Web', () => {
  const tree = renderer.create(
    <MemoryRouter>
      <AvatarBoxWeb {...props} />
    </MemoryRouter>).toJSON();
  expect(tree).toMatchSnapshot();
});
