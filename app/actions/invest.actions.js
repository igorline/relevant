import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

export
function getInvestData(type, searchInputObj) {
  return dispatch => {
  var searchObj = {'search': searchInputObj};

    return fetch(process.env.API_SERVER+'/api/invest', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchObj)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return {'type': type, 'data': responseJSON}
    })
    .catch((error) => {
      return {'type': 'error', 'data': error};
    });
  }
}


export function destroyInvestment(token, amount, post, investingUser){
  return dispatch => {
    //console.log(token, amount, post, investingUser, 'invest info');
    return fetch( process.env.API_SERVER + '/api/invest/destroy?access_token='+token, {
      credentials: 'include',
      method: 'POST',
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
       //dispatch(updatePost(post));
      return {message: responseJSON, true};

    })
    .catch((error) => {
      console.log(error);
      return {message: error, false}
    });
    }
  }
