import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';
import { api } from 'app/utils';

const earningScheema = new schema.Entity('earnings', {}, { idAttribute: '_id' });

export function setEarnings({ data, status }) {
  return {
    type: types.SET_EARNINGS,
    payload: { data, status }
  };
}

export function getEarnings(status, limit, skip) {
  return async dispatch => {
    try {
      const earnings = await api.request({
        method: 'GET',
        endpoint: 'earnings',
        query: {
          status,
          limit,
          skip
        }
      });
      const data = normalize(earnings, [earningScheema]);
      return dispatch(setEarnings({ data, status }));
    } catch (error) {
      return false;
    }
  };
}
