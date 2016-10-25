import * as types from '../actions/actionTypes';
import { push } from 'react-router-redux';

const addItems = (arr, newArr) => {
  if (!arr) arr = [];
  if (!arr.length) return newArr;
  var removeDuplicates = newArr.filter( (el) => {
    return arr.indexOf( el ) < 0;
  });
  var finalArr = arr.concat(removeDuplicates)
  var newArrX = finalArr.slice();
  return newArrX;
}

const initialState = { userInvestments: [], myInvestments: [] };

export default function investments(state = initialState, action) {
  switch (action.type) {

    case 'SET_INVESTMENTS': {
      let type = action.payload.type;
      return Object.assign({}, state, {
        [type]: addItems(state[type], action.payload.data),
      });
    }

    case 'REFRESH_INVESTMENTS': {
      let type = action.payload.type;
      return Object.assign({}, state, {
        [type]: action.payload.data,
      });
    }

    default:
      return state;
  }
};
