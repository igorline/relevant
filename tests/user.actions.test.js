import test from 'ava';
import nock from 'nock';
import mockStore from './_mockStore';

import * as types from '../app/actions/actionTypes';
import * as authActions from '../app/actions/auth.actions';

require('../app/publicenv');

test('should create an action SET_USER', t => {
  const user = {
    _id: 1,
    name: 'testName',
    email: 'testEmail',
    phone: 'testPhone',
    role: 'user',
    messages: 69,
    relevance: 666,
    balance: 666,
    posts: ['testPostId'],
    deviceTokens: ['testDeviceToken'],
    image: 'testImageUrl',
    hashedPassword: 'testHashedPass'
  };
  const expectedAction = {
    type: 'SET_USER',
    payload: user
  };
  t.deepEqual(authActions.setUser(user), expectedAction);
});

test('create SET_USER after new user is created', async t => {
  const token = 'some fake token';

  const newUser = {
    name: 'testName',
    phone: 'testPhone',
    email: 'testEmail',
    password: 'testPass'
  };

  nock(process.env.API_SERVER)
    .post('/api/user')
    .reply(200, { token });

  nock(process.env.API_SERVER)
    .get('/api/user/me')
    .reply(200, newUser);

  const expectedActions = [
    {
      type: types.LOGIN_USER_SUCCESS,
      payload: {
        token
      }
    },
    {
      type: types.SET_USER,
      payload: newUser
    }
  ];
  const store = mockStore({
    token: null,
    isAuthenticated: false,
    isAuthenticating: false,
    statusText: null,
    user: null,
    userIndex: null,
    deviceToken: null
  });

  await store.dispatch(authActions.createUser(newUser, false));

  t.deepEqual(store.getActions()[0], expectedActions[0]);
});
