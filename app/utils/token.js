let userDefaults;
let cookie;

if (process.env.WEB != 'true') {
  userDefaults = require('react-native-user-defaults').default;
} else {
  cookie = require('react-cookie');
}

const APP_GROUP_ID = 'group.com.4real.relevant';

let token;

export function get() {
  return new Promise((resolve, reject) => {

    if (token) return resolve(token);

    if (userDefaults) {
      return userDefaults.get('token', APP_GROUP_ID)
      .then((newToken) => {
        if (newToken) {
          token = newToken;
          return resolve(token);
        }
        console.log('userDefaults didnt find token');
        return reject();
      })
      .catch(err => reject(err));
    }
    // WEB
    let newToken = cookie.load('token');
    if (newToken) {
      token = newToken;
      return resolve(token);
    }
    return reject();
  });
}

export function remove() {
  token = null;
  if (userDefaults) return userDefaults.remove('token', APP_GROUP_ID);
  return new Promise(resolve => {
    cookie.remove('token');
    token = null;
    resolve();
  });
}

export function set(newToken) {
  token = newToken;
  if (userDefaults) {
    return userDefaults.set('token', newToken, APP_GROUP_ID);
  }
  return new Promise(resolve => {
    cookie.save('token', token);
    resolve();
  });
}

