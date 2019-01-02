import test from 'ava';
import nock from 'nock';

import * as types from 'core/actionTypes';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';

import mockStore from './_mockStore';

require('../app/publicenv');

test.afterEach(() => {
  // this runs after each test
  nock.cleanAll();
});

// testing action creator
test('should create set posts action', t => {
  const posts = [{ _id: 1 }, { _id: 2 }];
  const type = 'index';

  const expectedAction = {
    type: types.SET_POSTS,
    payload: {
      data: posts,
      type
    }
  };
  const action = postActions.setPosts(posts, 'index');
  t.deepEqual(action, expectedAction);
});

// testing async actions
test('should return setPosts action', async t => {
  const investingUser = { _id: 0, name: 'testUser' };
  const token = 0;
  const amount = 50;
  const post = {
    _id: 0,
    user: { _id: 'owner' }
  };

  nock(process.env.API_SERVER)
  .post('/api/invest?access_token=0')
  .reply(201, { _id: 0 });

  const investAction = {
    type: 'server/notification',
    payload: {
      user: post.user._id,
      message: investingUser.name + ' just invested in your post'
    }
  };

  const expectedActions = [investAction];
  const store = mockStore({ post });

  await store.dispatch(investActions.invest(token, amount, post, investingUser));

  t.deepEqual(store.getActions(), expectedActions);
});
