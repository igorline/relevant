import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';



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
      return {message: responseJSON, true};
    })
    .catch((error) => {
      console.log(error);
      return {message: error, false}
    });
    }
  }
