// GLOBAL.fetch = require('node-fetch');
require('isomorphic-fetch')
import expect from 'expect'; // You can use any testing library
import nock from 'nock'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as postActions from '../../actions/post.actions'
import * as investActions from '../../actions/invest.actions'
import * as authActions from '../../actions/auth.actions'
import * as types from '../../actions/actionTypes'
require('../../publicenv');
import {
    AsyncStorage,
    PushNotificationIOS
} from 'react-native';

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
  it('should create an action setPosts', () => {
    const posts = [ {'_id': 1}, {'_id': 2} ]
    const expectedAction = {
      type: types.SET_POSTS,
      payload: posts
    }
    expect(postActions.setPosts(posts)).toEqual(expectedAction)
  })
})


describe('async actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('creates UPDATE_POST when invest in post is done', (done) => {
    nock(process.env.API_SERVER)
      .put('/api/invest', invest)
      .reply(201, {_id: 0})

    const expectedActions = [
    ]
    const store = mockStore({ post: {index:[{_id: 0}]} })
    const invest = {
      postId: 0,
      sign: 1,
      amount: 1
    }
    const token = 0;
    const amount = 50;
    const post = {_id: 0};
    const investingUser = {_id: 0};

    store.dispatch(investActions.invest(token, amount, post, investingUser))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions)
      })
      .then(done) // test passed
      .catch(done) // test failed
  })
})