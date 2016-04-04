import * as types from '../actions/actionTypes';
import { push } from 'react-router-redux';
var CookieManager = require('react-native-cookies');


const initialState = {
  token: null,
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null,
  user: null,
  userIndex: null
};

export default function auth(state = initialState, action) {
  console.log(action.type)
  switch (action.type) {

    case types.LOGIN_USER_REQUEST:
      return Object.assign({}, state, {
        'isAuthenticating': true,
        'statusText': null
      })

    case types.LOGIN_USER_SUCCESS:
      CookieManager.set({
        name: 'myCookie',
        value: action.payload.token,
        domain: 'some domain',
        origin: 'some origin',
        path: '/',
        version: '1',
        expiration: '2015-05-30T12:30:00.00-05:00'
      }, (err, res) => {
        if (err) console.log('cookie ' + err);
        console.log('cookie ' + res);
      });
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': true,
        'token': action.payload.token,
        'statusText': 'You have been successfully logged in.'
      })
    case types.LOGIN_USER_FAILURE:
      CookieManager.clearAll((err, res) => {
        console.log('cookies cleared!');
        if (err) console.log(err);
        console.log(res);
      });
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': false,
        'token': null,
        'user': null,
        'statusText': `Authentication Error: ${action.payload.status} ${action.payload.statusText}`
      })

    case types.LOGOUT_USER:
      CookieManager.clearAll((err, res) => {
        console.log('cookies cleared!');
        if (err) console.log(err);
        console.log(res);
      });
      return Object.assign({}, state, {
        'isAuthenticated': false,
        'token': null,
        'user': null,
        'statusText': 'You have been successfully logged out.'
      })

    case types.SET_USER:
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': action.payload ? true : false,
        'user': action.payload
      })

    case types.SET_USER_INDEX:
      return Object.assign({}, state, {
        'userIndex': action.payload
      })

    case types.SET_CONTACTS:
      return Object.assign({}, state, {
        'contacts': action.payload
      })


    default:
      return state
  }
};
