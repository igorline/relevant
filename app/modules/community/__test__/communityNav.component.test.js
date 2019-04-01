import React from 'react';
import renderer from 'react-test-renderer';
import { Community } from 'modules/community/communityNav.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, community } from 'app/mockdata';
import * as communityActions from 'modules/community/community.actions';
import { setCommunity } from 'modules/auth/auth.actions';

const props = {
  community: community.community,
  auth: auth.auth,
  actions: {
    ...communityActions,
    setCommunity
  }
};

test('Snapshot NavProfile', () => {
  const tree = renderer
  .create(
    <MemoryRouter>
      <Community {...props} />
    </MemoryRouter>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
});
