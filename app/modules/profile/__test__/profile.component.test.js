import React from 'react';
import renderer from 'react-test-renderer';
import Profile from 'modules/profile/profile.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth } from 'app/mockdata';
import { Linkify } from 'app/utils/text';

jest.mock('react-redux', () => ({ useDispatch: () => () => {}, connect: el => el }));

const props = {
  user: auth.auth.user,
  actions: {
    hideModal: () => {},
    showModal: () => {}
  }
};

test('Snapshot own Profile', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Profile {...props} isOwner bio={<Linkify>{props.user.bio}</Linkify>} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test('Snapshot other users Profile', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Profile {...props} bio={<Linkify>{props.user.bio}</Linkify>} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
