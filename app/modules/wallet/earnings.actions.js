import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';
import { api } from 'app/utils';
import { postSchema, setPostsSimple } from 'modules/post/post.actions';

const earningSchema = new schema.Entity(
  'earnings',
  {
    post: postSchema
  },
  { idAttribute: '_id' }
);

export function setEarnings({ data, status, skip }) {
  return {
    type: types.SET_EARNINGS,
    payload: { data, status, skip }
  };
}

export function getEarnings(status, limit, skip) {
  return async dispatch => {
    try {
      const earnings = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'earnings',
          query: {
            status,
            limit,
            skip
          }
        })
      );
      const data = normalize(earnings, [earningSchema]);
      dispatch(setEarnings({ data, status, skip }));
      dispatch(setPostsSimple(data));
      return true;
    } catch (error) {
      return false;
    }
  };
}
