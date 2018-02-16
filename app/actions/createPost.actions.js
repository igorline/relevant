import * as types from './actionTypes';
import * as utils from '../utils';

utils.api.env();
const apiServer = process.env.API_SERVER + '/api/';

export function setCreaPostState(state) {
  return {
    type: types.SET_CREATE_POST_STATE,
    payload: state
  };
}


export function setPostCategory(tag) {
  const set = tag || null;
  return {
    type: 'SET_POST_CATEGORY',
    payload: set,
  };
}

export function clearCreatePost() {
  return {
    type: 'CLEAR_CREATE_POST',
  };
}


export function submitPost(post) {
  return async () => {
    try {
      return await utils.api.request({
        method: 'POST',
        endpoint: 'post',
        body: JSON.stringify(post)
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
}

// export function submitPost(post, token) {
//   return (dispatch) => {
//     return fetch(apiServer + 'post?access_token=' + token,
//       {
//         credentials: 'include',
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(post)
//       })
//     .then((response) => {
//       // console.log(response, 'submitPost response');
//       if (response.status === 200) {
//         return response;
//       }
//       return false;
//     })
//     .catch(error => false);
//   };
// }
