import React from 'react';
import renderer from 'react-test-renderer';
import Post from 'modules/post/web/post.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';
import { auth, post, user } from 'app/mockdata';

jest.mock('modules/comment/web/singleComment.container', () => 'SingleCommnetContainer');

const props = {
  post: post.post1,
  link: post.post1.link,
  actions: {},
  userState: user.usersState,
  auth: auth.auth,
  location: { pathname: 'post/' + post.post1._id },
  history: { push: jest.fn() },
  navigation: {
    screenSize: 0
  }
};

jest.mock('react-redux', () => {
  const state = {
    navigation: { screenSize: 0 }
  };

  return {
    useDispatch: () => {},
    useSelector: fn => fn(state),
    connect: el => el
  };
});

test('Snapshot Post Web', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Post {...props} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
