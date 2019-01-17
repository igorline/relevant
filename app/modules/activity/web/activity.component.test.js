import React from 'react';
import renderer from 'react-test-renderer';
import Activity from 'modules/activity/web/activity.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, activity } from 'app/utils/testData';

const props = {
  singleActivity: activity,
  auth
};

test('Snapshot Post Web', () => {
  const tree = renderer.create(
    <MemoryRouter><Activity {...props} /></MemoryRouter>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
