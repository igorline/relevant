import * as types from './actionTypes';
// require('../publicenv');
import * as utils from '../utils';
import * as authActions from './auth.actions';

utils.api.env();


export function setStats(data) {
  return {
    type: 'SET_STATS',
    payload: data
  };
}

export function addStats(data) {
  return {
    type: 'ADD_STATS',
    payload: {
      user: data.user,
      data: data.data
    }
  };
}

export function parseStats(data) {
  return (dispatch) => {
    let d = new Date();
    let currentHour = d.getHours();
    let prevHour = currentHour--;
    let dataObj = {};
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
      let responseJSON = await utils.api.request({
        method: 'GET',
        endpoint: 'statistics',
        path: '/all',
      });
      dispatch(parseStats(responseJSON));
    } catch (err) {
      console.log(err, 'error');
    }
  };
}


export function getStats(id) {
  let present = new Date();
  let past = new Date(present - 1000 * 60 * 60 * 1);
  return async dispatch => {
    try {
      let res = await utils.api.request({
        method: 'GET',
        endpoint: 'statistics',
        path: `/change/${id}?startTime=${past}'&endTime=${present}`,
      });
      dispatch(addStats({ user: id, data: res }));
    } catch (err) {
      console.log(err, 'error');
    }
  };
}

