import * as types from '../actions/actionTypes';

const initialState = {read: 1, discover: 1, post: 'url', profile: 1};
const REPLACE = 'REPLACE';


export default function auth(state = initialState, action) {
  switch (action.type) {
    case 'SET_VIEW': {
      switch(action.payload.type) {
        case 'read':
          return Object.assign({}, state, {
            'read':  action.payload.view ? action.payload.view : state.read,
          })
          break;

        case 'discover':
          return Object.assign({}, state, {
            'discover': action.payload.view ? action.payload.view : state.discover,
          })
          break;

        case 'post':
          return Object.assign({}, state, {
            'post':  action.payload.view ? action.payload.view : state.post.view
          })
          break;

        case 'profile':
          return Object.assign({}, state, {
            'profile':  action.payload.view ? action.payload.view : state.profile.view
          })
          break;

        default:
          return state;
      }
    }

    default:
      return state
  }
};
