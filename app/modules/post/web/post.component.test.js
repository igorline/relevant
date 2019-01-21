import React from 'react';
import renderer from 'react-test-renderer';
import { Post } from 'modules/post/web/post.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, post1, usersState } from 'app/utils/testData';

const props = {
  post: post1,
  link: post1.link,
  actions: {},
  usersState,
  auth,
  location: { pathname: 'post/' + post1._id },
  history: { push: jest.fn() }
};

test('Snapshot Post Web', () => {
  const tree = renderer.create(
    <MemoryRouter>
      <Post {...props} />
    </MemoryRouter>).toJSON();
  expect(tree).toMatchSnapshot();
});
