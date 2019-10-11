import * as types from 'core/actionTypes';
import { api } from 'app/utils';

export function setStats(data) {
  return {
    type: types.SET_STATS,
    payload: data
  };
}

export function addStats(data) {
  return {
    type: types.ADD_STATS,
    payload: {
      user: data.user,
      data: data.data
    }
  };
}

export function parseStats(data) {
  return dispatch => {
    const d = new Date();
    let currentHour = d.getHours();
    const prevHour = currentHour--;
    const dataObj = {};
    data.stats.forEach(item => {
      dataObj[item.user] = {};
      dataObj[item.user].value = 0;
      if (item.hours[prevHour]) dataObj[item.user].value = item.hours[prevHour];
    });
    dispatch(setStats(dataObj));
  };
}

export function getAllStats() {
  return async dispatch => {
    try {
      const responseJSON = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'statistics',
          path: '/all'
        })
      );
      return dispatch(parseStats(responseJSON));
    } catch (err) {
      return null;
    }
  };
}

export function getStats(id) {
  const present = new Date();
  const past = new Date(present - 1000 * 60 * 60 * 1);
  return async dispatch => {
    try {
      const res = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'statistics',
          path: `/change/${id}?startTime=${past}'&endTime=${present}`
        })
      );
      return dispatch(addStats({ user: id, data: res }));
    } catch (err) {
      return null;
    }
  };
}
