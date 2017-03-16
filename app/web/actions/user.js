const getOptions = {
  credentials: 'include',
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};

export
function setUserSearch(data) {
  return {
    type: 'SET_USER_SEARCH',
    payload: data
  };
}

export function searchUser(userName) {
  let limit = 50;
  let url = '/api/user/search' +
    '?limit=' + limit +
    '&search=' + userName;
  return (dispatch) => {
    fetch(url, getOptions)
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setUserSearch(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
      // dispatch(errorActions.setError('activity', true, error.message));
    });
  };
}
