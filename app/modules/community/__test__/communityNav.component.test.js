import React from 'react';
import renderer from 'react-test-renderer';
import { Community } from 'modules/community/communityNav.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
// import * as communityActions from 'modules/community/community.actions';
// import { setCommunity } from 'modules/auth/auth.actions';

jest.mock('modules/community/hooks', () => ({ useUnread: () => 5 }));

jest.mock('react-redux', () => {
  const { auth, community } = require('app/mockdata');
  const state = {
    auth: auth.auth,
    community: community.community,
    navigation: { screenSize: 0 }
  };

  return {
    useDispatch: () => () => {},
    useSelector: fn => fn(state),
    connect: el => el
  };
});

test('Snapshot NavProfile', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Community />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
