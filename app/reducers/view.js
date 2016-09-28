import * as types from '../actions/actionTypes';

const initialState = {read: 1, discover: 1, route: null, nav: null, post: {view: 'url'}, back: false, name: null};
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
            'post': {
              view: action.payload.view ? action.payload.view : state.post.view,
              category: action.payload.category ? action.payload.category : false
            }
          })
          break;

        default:
          return
      }
    }

    case 'SET_NAV':
          return Object.assign({}, state, {
            'nav': action.payload.nav,
            'route': action.payload.route,
          })
       break

    default:
      return state
  }
};
