import {
    AlertIOS
} from 'react-native';

require('../publicenv');

let apiServer = process.env.API_SERVER+'/api/';

export function invest(token, amount, post, investingUser) {
  return (dispatch) => {
    return fetch(apiServer + 'invest?access_token=' + token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        amount,
        post
      })
    })
    .then((response) => {
      console.log(response, 'response here');
      if (response.ok) {
        dispatch(investNotification(post, investingUser));
        return true;
      } else {
        return response.text();
      }
    })
    .then((data) => {
      if (typeof data !== 'boolean') {
        let errorString = data.replace(/['"]+/g, '');
        AlertIOS.alert(errorString);
        return false;
      } else {
        return true;
      }
    })
    .catch((error) => {
      AlertIOS.alert(error);
      return false;
    });
  };
}

export function getInvestments(token, userId, skip, limit, type){
  return (dispatch) => {
    return fetch(apiServer + 'invest/'+userId+'?skip='+skip+'&limit='+limit+'&access_token='+token, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      if (skip === 0) dispatch(refreshInvestments(responseJSON, type));
      else dispatch(setInvestments(responseJSON, type));
    })
    .catch((error) => {
      console.log(error);
    });
  };
}

export function setInvestments(data, type) {
  return {
    type: 'SET_INVESTMENTS',
    payload: {
      data,
      type
    }
  };
}

export function refreshInvestments(data, type) {
  return {
    type: 'REFRESH_INVESTMENTS',
    payload: {
      data,
      type
    }
  };
}


export function investNotification(post, investingUser) {
  return {
    type: 'server/notification',
    payload: {
      user: post.user._id,
      message: investingUser.name + ' just invested in your post'
    }
  };
}

export function destroyInvestment(token, amount, post, investingUser){
  return dispatch => {
    return fetch( process.env.API_SERVER + '/api/invest/destroy?access_token='+token, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        poster: post.user._id,
        amount: amount,
        post: post._id
      })
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
  };
}
