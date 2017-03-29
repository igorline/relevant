import * as tokenUtil from './token';


export function env() {
  if (process.env.WEB != 'true') {
    require('../publicenv');
    return process.env;
  }
  return process.env;
}

export function Alert() {
  if (process.env.WEB != 'true') {
    return require('react-native').AlertIOS;
  } else if (process.env.BROWSER) {
    return window;
  }
  return { alert: (a, b) => console.log(a, ' ', b) };
}


export async function reqOptions() {
  let token;
  try {
    token = await tokenUtil.get();
  } catch (err) {
    console.log('no token');
  }
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
}

export async function handleErrors(response) {
  if (!response.ok) {
    console.log('error response', response);
    let error = response.statusText;
    try {
      let json = await response.json();
      if (json) {
        error = json.message;
        throw Error(error);
      }
    } catch (err) {
      throw Error(error);
    }
  }
  return response;
}
