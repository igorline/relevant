import test from 'ava';

import reducer from '../app/reducers/posts';

test('add new post to index', t => {
  const state = reducer(
    undefined,
    {
      type: 'ADD_POST',
      payload: {
        data: { _id: 0 },
        type: 'index'
      }
    }
  );
  t.deepEqual(state.newPosts.index, [{ _id: 0 }]);
});
