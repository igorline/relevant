import * as types from '../actions/actionTypes';

const maxGarbage = 10;

const addItems = (arr, newArr) => {
  if (!arr.length) return newArr;
  const removeDuplicates = newArr.filter((el) => {
    return arr.indexOf(el) < 0;
  });
  let finalArr = arr.concat(removeDuplicates);
  return finalArr;
};

const initialState = {
  error: false,
  selectedUserData: {},
  list: [],
  online: [],
  loaded: false,
  loading: false,
  garbage: [],
  search: [],
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.SET_USER_SEARCH : {
      return {
        ...state,
        search: action.payload.length ? action.payload : initialState.search
      };
    }

    case 'SET_SELECTED_USER_DATA': {
      return {
        ...state,
        selectedUserData: {
          ...state.selectedUserData,
          [action.payload._id]: action.payload,
        }
      };
    }

    case 'GET_USER_LIST': {
      return Object.assign({}, state, {
        loading: true,
      });
    }

    // case 'GET_USER_LOADING': {
    //  return Object.assign({}, state, {
    //     loaded: false,
    //   });
    // }

    case 'SET_USER_LIST': {
      let key = action.payload.filter || 'list';
      return Object.assign({}, state, {
        [key]: [
          ...state[key].slice(0, action.payload.index),
          ...action.payload.users
        ],
        loading: false,
        loaded: true,
      });
    }

    case types.UPDATE_USER:
      return {
        ...state,
        selectedUserData: {
          ...state.selectedUserData,
          [action.payload._id]: {
            ...state.selectedUserData[action.payload._id],
            ...action.payload,
          }
        }
      };

    case 'CLEAR_USER_LIST': {
      return Object.assign({}, state, {
        list: [],
      });
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
};
