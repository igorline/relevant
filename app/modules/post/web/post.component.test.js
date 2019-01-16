import React from 'react';
import renderer from 'react-test-renderer';
import { Post } from 'modules/post/web/post.component';
import 'jest-styled-components';
import { MemoryRouter } from 'react-router-dom';

const user = { _id: 123, handle: 'handle', name: 'Name', relevance: { pagerank: 10 } };
const post = {
  _id: 234,
  user: 456,
  title: 'postTitle',
  embeddedUser: user,
  tags: ['tag1', 'tag2'],
  body: 'awesome post!',
  postDate: new Date(),
  data: { pagerank: 45, payout: 18 * (10 ** 18) },
  link: { image: 'link_img.jpg', url: 'https://example.com/test', domain: 'link.domain', title: 'postTitle' }
};

const props = {
  post,
  link: post.link,
  actions: {},
  user: { users: { 123: user } },
  auth: { community: 'testCommunity', user, isAuthenticated: true },
  location: { pathname: 'post/' + post._id },
  history: { push: jest.fn() }
};

test('Snapshot Post Web', () => {
  const tree = renderer.create(
    <MemoryRouter>
      <Post {...props} />
    </MemoryRouter>).toJSON();
  expect(tree).toMatchSnapshot();
});
