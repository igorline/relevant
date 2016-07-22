import * as types from '../actions/actionTypes';

const initialState = {read: 1, discover: 1};
const REPLACE = 'REPLACE';


export default function auth(state = initialState, action) {
  switch (action.type) {
    case 'SET_VIEW': {
      switch(action.payload.type) {
        case 'read':
          return Object.assign({}, state, {
            'read': action.payload.view,
          })
          break;

        case 'discover':
          return Object.assign({}, state, {
            'discover': action.payload.view,
          })
          break;

        default:
          return
      }
    }

    default:
      return state
  }
};
