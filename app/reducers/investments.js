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


const initialState = { userInvestments: [], myInvestments: [] };

export default function investments(state = initialState, action) {
  switch (action.type) {

    case 'SET_MY_INVESTMENTS': {
      return Object.assign({}, state, {
        'myInvestments': addItems(state.myInvestments, action.payload),
      })
    }

    case 'SET_USER_INVESTMENTS': {
      return Object.assign({}, state, {
        'userInvestments': addItems(state.userInvestments, action.payload),
      })
    }

    case 'CLEAR_USER_INVESTMENTS': {
      return Object.assign({}, state, {
        'userInvestments': [],
      });
    }

    default:
      return state
  }
};
