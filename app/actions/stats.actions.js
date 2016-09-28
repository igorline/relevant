import * as types from './actionTypes';
require('../publicenv');
import * as utils from '../utils';
import * as authActions from './auth.actions';

// http://localhost:3000/api/statistics/change/56fb0f9c5135da5c18752422?startTime=Wed Sep 21 2016 13:05:34 GMT-0400 (EDT)&endTime=Wed Sep 21 2016 14:05:34 GMT-0400 (EDT)


export function getAllStats() {
  return function(dispatch) {
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
      console.log(responseJSON, 'stats response');
      dispatch(parseStats(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function parseStats(data) {
  return function(dispatch) {
    console.log('parseStats');
    var d = new Date();
    var currentHour = d.getHours();
    var prevHour = currentHour --;
    var dataObj = {};
    var val = null;
    data.stats.forEach(function(item, i) {
      dataObj[item.user] = {};
      dataObj[item.user].value = 0;
      if (item.hours[prevHour]) dataObj[item.user].value = item.hours[prevHour];
    });
    console.log(dataObj, 'dataObj')
    dispatch(setStats(dataObj));
  }
}

export function getStats(id) {
  var present = new Date();
  var past = new Date(present - 1000 * 60 * 60 * 1);
 
  var url = process.env.API_SERVER+'/api/statistics/change/'+id+'?startTime='+past+'&endTime='+present;
  return function(dispatch) {
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
      //console.log(responseJSON, 'stats response');
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
