import * as types from './actionTypes';
require('../publicenv');
import * as utils from '../utils';

var apiServer = process.env.API_SERVER+'/api/'

export function invest(token, amount, post, investingUser){
  return dispatch => {
    return fetch( apiServer + 'invest?access_token='+token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        amount: amount,
        post: post
      })
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log('response', responseJSON)
      dispatch(investNotification(post, investingUser));
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
  }
}

export function getInvestments(token, userId, skip, limit){
  return dispatch => {
    return fetch( apiServer + 'invest/'+userId+'?skip='+skip+'&limit='+limit+'&access_token='+token, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setInvestments(userId, responseJSON));
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

export function setInvestments(userId, data) {
    return {
        type: 'SET_INVESTMENTS',
        payload: {
          data: data,
          user: userId
        }
    };
}

export
function clearInvestments() {
    return {
        type: 'CLEAR_INVESTMENTS',
    };
}


export function investNotification(post, investingUser) {
  return {
    type: 'server/notification',
    payload: {
      user: post.user._id,
      message: investingUser.name+' just invested in your post'
    }
  }
}

export function destroyInvestment(token, amount, post, investingUser){
  return dispatch => {
    return fetch( process.env.API_SERVER + '/api/invest/destroy?access_token='+token, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        poster: post.user._id,
        amount: amount,
        post: post._id
      })
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
    }
  }
