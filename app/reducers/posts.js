import * as types from '../actions/actionTypes';

const initialState = {index: null, userPosts: null, postError: null, activePost: null};

export default function auth(state = initialState, action) {
  console.log(action.type)
  switch (action.type) {

    case types.SET_POSTS: {
      return Object.assign({}, state, {
        'index': action.payload
      })
    }

    case types.SET_USER_POSTS: {
      return Object.assign({}, state, {
        'userPosts': action.payload
      })
    }

    case types.POST_ERROR: {
      return Object.assign({}, state, {
        'postError': action.payload
      })
    }

    case types.SET_ACTIVE_POST: {
      return Object.assign({}, state, {
        'activePost': action.payload
      })
    }

    case types.UPDATE_POST: {
      return Objext.assign({}, state, {
        'index': state.index.map( post => {
          console.log("POST ID", post._id)
          console.log("PAYLOAD ID", action.payload._id)

          if(post._id == action.payload._id){
            post = action.payload;
            console.log("GOT IT", post)
          }
          return post;
        })
      })
    }


    default:
      return state
  }
};
