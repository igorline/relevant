import * as types from '../actions/actionTypes';

const initialState = {false};
const REPLACE = 'REPLACE';


export default function auth(state = initialState, action) {
  switch (action.type) {

    case 'SET_ERROR': {
      return action.payload;
    }

    default:
      return false
  }
};
