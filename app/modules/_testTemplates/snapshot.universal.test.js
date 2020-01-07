import React from 'react';
import renderer from 'react-test-renderer';
import AvatarBox from 'modules/user/avatarbox.component';
import { MemoryRouter } from 'react-router-dom';

const user = { _id: 123, handle: 'handle', name: 'Name', relevance: { pagerank: 10 } };
const postTime = new Date().toISOString();

jest.mock('react-redux', () => ({ useDispatch: () => () => {}, connect: el => el }));

const props = {
  user,
  relevance: false,
  postTime,
  setSelected: jest.fn()
};

test('Snapshot AvatarBox Styled', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <AvatarBox {...props} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
