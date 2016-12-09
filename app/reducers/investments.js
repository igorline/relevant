import * as types from '../actions/actionTypes';

// const addItems = (arr, newArr) => {
//   if (!arr) arr = [];
//   if (!arr.length) return newArr;
//   let removeDuplicates = newArr.filter( (el) => {
//     return arr.indexOf( el ) < 0;
//   });
//   let finalArr = arr.concat(removeDuplicates);
//   let newArrX = finalArr.slice();
//   return newArrX;
// };

const initialState = {
  userInvestments: {},
  loaded: false
};

export default function investments(state = initialState, action) {
  switch (action.type) {

    case 'SET_INVESTMENTS': {
      let id = action.payload.userId;
      let currentInvestments = state.userInvestments[id] || [];
      return {
        ...state,
        userInvestments: {
          ...state.userInvestments,
          [id]: [
            ...currentInvestments.slice(0, action.payload.index),
            ...action.payload.investments
          ]
        },
        loaded: true,
      };
    }

    case 'LOADING_INVESTMENTS': {
      return {
        ...state,
        loaded: false,
      };
    }

    // case 'REFRESH_INVESTMENTS': {
    //   let type = action.payload.type;
    //   return Object.assign({}, state, {
    //     [type]: action.payload.data,
    //   });
    // }

    default:
      return state;
  }
};
