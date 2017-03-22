import * as types from './actionTypes';
// require('../publicenv');
import * as utils from '../utils';
import * as authActions from './auth.actions';

utils.fetchUtils.env();

export function getAllStats() {
  return (dispatch) => {
    var url = process.env.API_SERVER+'/api/statistics/all';
    fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(parseStats(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  };
}

export function parseStats(data) {
  return (dispatch) => {
    var d = new Date();
    var currentHour = d.getHours();
    var prevHour = currentHour --;
    var dataObj = {};
    var val = null;
    data.stats.forEach((item, i) => {
      dataObj[item.user] = {};
      dataObj[item.user].value = 0;
      if (item.hours[prevHour]) dataObj[item.user].value = item.hours[prevHour];
    });
    dispatch(setStats(dataObj));
  }
}

export function getStats(id) {
  var present = new Date();
  var past = new Date(present - 1000 * 60 * 60 * 1);
  var url = process.env.API_SERVER+'/api/statistics/change/'+id+'?startTime='+past+'&endTime='+present;
  return (dispatch) => {
    fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then((response) => {
      if (!response.ok) {
        throw 'no stats';
        return;
      }
      return response.json();
    })
    .then((responseJSON) => {
      dispatch(addStats({user: id, data: responseJSON}));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export
function setStats(data) {
    return {
        type: 'SET_STATS',
        payload: data
    };
}

export
function addStats(data) {
    return {
        type: 'ADD_STATS',
        payload: {
          user: data.user,
          data: data.data
        }
    };
}
