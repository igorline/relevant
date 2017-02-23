import * as types from '../actions/actionTypes';

const initialState = {
  userInvestments: {},
  investments: {},
  loaded: false,
  myInvestments: [],
  myEarnings: {}
};

export default function investments(state = initialState, action) {
  switch (action.type) {

    case types.UNDO_POSTS_INVEST: {
      let index = state.myInvestments.indexOf(action.payload);
      return {
        ...state,
        myInvestments: [
          ...state.myInvestments.slice(0, index),
          ...state.myInvestments.slice(index + 1)
        ]
      };
    }

    case types.UPDATE_EARNINGS: {
      let earnings = {};
      action.payload.forEach(earning => {
        earnings[earning.post] = earning;
      });
      return {
        ...state,
        myEarnings: {
          ...state.myEarnings,
          ...earnings
        }
      };
    }

    case types.UPDATE_POSTS_INVEST: {
      return {
        ...state,
        myInvestments: [...state.myInvestments, ...action.payload]
      };
    }

    case 'SET_INVESTMENTS': {
      let id = action.payload.userId;
      let currentInvestments = state.userInvestments[id] || [];
      return {
        ...state,
        userInvestments: {
          ...state.userInvestments,
          [id]: [
            ...currentInvestments.slice(0, action.payload.index),
            ...action.payload.investments.result.investments
          ],
        },
        investments: {
          ...state.investments,
          ...action.payload.investments.entities.investments
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

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
