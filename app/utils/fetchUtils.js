import * as tokenUtil from './token';

export function Alert() {
  if (process.env.WEB != true) {
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
    throw err;
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

export function handleErrors(response) {
  if (!response.ok) {
    console.log('error response', response);
    throw Error(response.statusText);
    return false;
  }
  return response;
}
