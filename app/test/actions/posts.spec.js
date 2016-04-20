// GLOBAL.fetch = require('node-fetch');
require('isomorphic-fetch')
import expect from 'expect'; // You can use any testing library
import nock from 'nock'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../../actions/postActions'
import * as types from '../../actions/actionTypes'
require('../../publicenv');

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
  it('should create an action setPosts', () => {
    const posts = [ {'_id': 1}, {'_id': 2} ]
    const expectedAction = {
      type: types.SET_POSTS,
      payload: posts
    }
    expect(actions.setPosts(posts)).toEqual(expectedAction)
  })
})


describe('async actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('creates UPDATE_POST when invest in post is done', (done) => {
    nock(process.env.API_SERVER)
      .put('/api/post/0/invest', invest)
      .reply(201, {_id: 0})

    const expectedActions = [
      // { type: types.FETCH_TODOS_REQUEST },
      { type: types.UPDATE_POST, payload: {_id: 0}}
    ]
    const store = mockStore({ post: {index:[{_id: 0}]} })
    const invest = {
      postId: 0,
      sign: 1,
      amount: 1
    }
    const token = 0;

    store.dispatch(actions.invest(token, invest))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions)
      })
      .then(done) // test passed
      .catch(done) // test failed
  })
})