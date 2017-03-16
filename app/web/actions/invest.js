export const INVESTMENT_FOUND = 'INVESTMENT_FOUND';
export const INVEST_SUCCESS = 'INVEST_SUCCESS';
export const INVEST_FAILURE = 'INVEST_FAILURE';
export const UNINVEST_SUCCESS = 'UNINVEST_SUCCESS';
export const UNINVEST_FAILURE = 'UNINVEST_FAILURE';

import * as utils from '../utils';

var request = require('superagent');

export function createInvestment(token, amount, post, investingUserID){
  if(!token) token = utils.auth.getToken();

  var investmentObj = {
    investor: investingUserID,
    amount: amount,
    post: post
  };

  return function(dispatch) {
    request
    .post('/api/invest?access_token=' + token)
    .send(investmentObj)
    .end(function(error, response){
      if (error || !response.ok) {
        console.log(error, 'errror')
        dispatch(investFailure());
      } else {
        dispatch(investSuccess());
      }
    });
  }
}

export function deleteInvestment(token, post, investingUserID){
  if(!token) token = utils.auth.getToken();

  var investObj = {
    investor: investingUserID,
    post: post._id
  };

  return function(dispatch) {
    request
    .delete('/api/invest/destroy?access_token=' + token)
    .send(investObj)
    .end(function(error, response){
      if (error || !response.ok) {
        dispatch(uninvestFailure());
      } else {
        dispatch(uninvestSuccess());
      }
    });
  }
}

export function checkInvestment(userID, investments) {
  return function(dispatch) {  
    for (var i = 0; i < investments.length; i++) {
      if (investments[i].investor === userID) {
        dispatch(investmentFound());
      }
    }
  }
}

function investmentFound() {
  return {
    type: "INVESTMENT_FOUND"
  };
}

function investSuccess() {
  return {
    type: "INVEST_SUCCESS"
  };
}

function investFailure() {
  return {
    type: "INVEST_FAILURE",
    text: 'Something went wrong. Please try again'
  };
}

function uninvestSuccess() {
  return {
    type: "UNINVEST_SUCCESS"
  };
}

function uninvestFailure() {
  return {
    type: "UNINVEST_FAILURE",
    text: 'Something went wrong. Please try again'
  };
}