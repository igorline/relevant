import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import * as actions from 'modules/post/post.actions';
import * as types from 'app/core/actionTypes';
import { queryParams } from 'app/utils/api';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  const sort = 'top';
  const skip = 10;
  const limit = 20;
  const params = { skip, sort, limit, tags: null };
  const type = sort ? 'top' : 'new';

  const queryString = queryParams(params);

  it('creates SET_POSTS when getting posts has been done', async () => {
    fetchMock.getOnce(`/api/communityFeed${queryString}`, {
      body: [
        {
          _id: 'parent1',
          metaPost: { _id: 'metaPost1' },
          commentary: [{ _id: 'post1' }, { _id: 'post2' }]
        },
        {
          _id: 'parent2',
          metaPost: { _id: 'metaPost2' },
          commentary: [{ _id: 'post3' }, { _id: 'post4' }]
        }
      ],
      headers: { 'content-type': 'application/json' }
    });

    const expectedActions = [
      { type: types.GET_POSTS, payload: type },
      {
        type: types.SET_POSTS,
        payload: {
          data: {
            entities: {
              links: {
                metaPost1: { _id: 'metaPost1' },
                metaPost2: { _id: 'metaPost2' }
              },
              posts: {
                parent1: {
                  _id: 'parent1',
                  commentary: ['post1', 'post2'],
                  metaPost: 'metaPost1',
                  top: ['post1', 'post2']
                },
                parent2: {
                  _id: 'parent2',
                  commentary: ['post3', 'post4'],
                  metaPost: 'metaPost2',
                  top: ['post3', 'post4']
                },
                post1: { _id: 'post1' },
                post2: { _id: 'post2' },
                post3: { _id: 'post3' },
                post4: { _id: 'post4' }
              }
            },
            result: { top: ['parent1', 'parent2'] }
          },
          type,
          index: skip
        }
      },
      { type: types.SET_ERROR, payload: { type: 'discover', bool: false } }
    ];

    const store = mockStore({ posts: [], auth: {}, community: 'relevant' });

    await store.dispatch(actions.getPosts(skip, null, sort, limit));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
