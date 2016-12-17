import {
    AlertIOS
} from 'react-native';

require('../publicenv');

let apiServer = process.env.API_SERVER+'/api/';

export function setInvestments(investments, userId, index) {
  return {
    type: 'SET_INVESTMENTS',
    payload: {
      investments,
      userId,
      index
    }
  };
}

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
      console.log(error, 'error here');
      AlertIOS.alert(error.message);
    });
  };
}

export function loadingInvestments() {
  return {
    type: 'LOADING_INVESTMENTS',
  };
}

export function getInvestments(token, userId, skip, limit, type){
  return (dispatch) => {
    dispatch(loadingInvestments());
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
      // dispatch(refreshInvestments(responseJSON, userId, skip));
      dispatch(setInvestments(responseJSON, userId, skip));
    })
    .catch((error) => {
      console.log(error);
    });
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
