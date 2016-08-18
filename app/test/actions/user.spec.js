require('isomorphic-fetch')
import expect from 'expect';
import nock from 'nock'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as postActions from '../../actions/post.actions'
import * as authActions from '../../actions/auth.actions'
import * as investActions from '../../actions/invest.actions'
require('../../publicenv');
const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)
import {
    AsyncStorage,
    PushNotificationIOS
} from 'react-native';

describe('actions', () => {
  it('should create an action SET_USER', () => {
    const user = {
      '_id': 1,
      'name': 'testName',
      'email': 'testEmail',
      'phone': 'testPhone',
      'role': 'user',
      'messages': 69,
      'relevance': 666,
      'balance': 666,
      'posts': ['testPostId'],
      'deviceTokens': ['testDeviceToken'],
      'image': 'testImageUrl',
      'hashedPassword': 'testHashedPass'
    };
    const expectedAction = {
      type: 'SET_USER',
      payload: user
    }
    expect(authActions.setUser(user)).toEqual(expectedAction)
  })
})


describe('async actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('creates SET_USER after new user is created', (done) => {
    nock(process.env.API_SERVER)
      .post('/api/user', newUser)
      .reply(201, {token: 0})

    const expectedActions = [
      { type: 'SET_USER', payload: {
        '_id': 1,
        'name': 'testName',
        'email': 'testEmail',
        'phone': 'testPhone',
        'role': 'user',
        'messages': 69,
        'relevance': 666,
        'balance': 666,
        'posts': ['testPostId'],
        'deviceTokens': ['testDeviceToken'],
        'image': 'testImageUrl',
        'hashedPassword': 'testHashedPass'
      }}
    ]
    const store = mockStore({
      token: null,
      isAuthenticated: false,
      isAuthenticating: false,
      statusText: null,
      user: null,
      userIndex: null,
      deviceToken: null
    })
    const newUser = {
      name: 'testName',
      phone: 'testPhone',
      email: 'testEmail',
      password: 'testPass'
    }
    const token = 0;

    store.dispatch(authActions.createUser(newUser, false))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions)
      })
      .then(done) // test passed
      .catch(done) // test failed
  })
})