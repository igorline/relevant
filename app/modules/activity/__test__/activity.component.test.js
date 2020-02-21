import React from 'react';
import renderer from 'react-test-renderer';
import Activity from 'modules/activity/activity.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, activity } from 'app/mockdata';
import { Text } from 'modules/styled/uni';

jest.mock('modules/post/web/post.component', () => 'PostComponent');
jest.mock('react-redux', () => ({ useDispatch: () => () => {}, connect: el => el }));

const props = {
  singleActivity: activity.activity,
  auth: auth.auth,
  actions: {
    goToProfile: jest.fn()
  },
  PostComponent: Text
};

test('Snapshot Activity Web', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Activity {...props} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
