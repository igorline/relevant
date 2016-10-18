import * as types from '../actions/actionTypes';
import { push } from 'react-router-redux';

const addItems = (arr, newArr) => {
  if (!arr) arr = [];
  if (!arr.length) return newArr;
  var removeDuplicates = newArr.filter( function( el ) {
    return arr.indexOf( el ) < 0;
  });
  var finalArr = arr.concat(removeDuplicates)
  var newArrX = finalArr.slice();
  return newArrX;
}


const initialState = {index: null, user: null};

export default function investments(state = initialState, action) {
  switch (action.type) {

    case 'SET_INVESTMENTS': {
      return Object.assign({}, state, {
        'index': addItems(state.index, action.payload.data),
        'user': action.payload.user
      })
    }

    case 'CLEAR_INVESTMENTS': {
      return Object.assign({}, state, {
        'index': null,
        'user': null
      })
    }

    default:
      return state
  }
};
