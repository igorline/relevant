import React from 'react';
import renderer from 'react-test-renderer';
import Activity from 'modules/activity/activity.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, activity } from 'app/mockdata';

// jest.mock('modules/comment/web/singleComment.container', () => 'SingleCommnetContainer');
jest.mock('modules/post/web/post.component', () => 'PostComponent');

const props = {
  singleActivity: activity.activity,
  auth: auth.auth,
  actions: {
    goToProfile: jest.fn()
  }
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
