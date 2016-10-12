import * as types from '../actions/actionTypes';
import { push } from 'react-router-redux';

const addItems = (arr, newArr) => {
  if (!arr.length) return newArr;
  var removeDuplicates = newArr.filter( function( el ) {
    return arr.indexOf( el ) < 0;
  });
  var finalArr = arr.concat(removeDuplicates)
  return finalArr;
}


const initialState = {};

export default function investments(state = initialState, action) {
  switch (action.type) {

    case 'SET_INVESTMENTS': {
      var user = action.payload.user;
      var arr = [];
      if (state[user]) arr = state[user];
      //console.log(action.payload.investments, 'adding investments');
      var newObj = {
          ...state,
          [user]: addItems(arr, action.payload.investments)
      };

      return Object.assign({}, state, newObj)
    }

    default:
      return state
  }
};
