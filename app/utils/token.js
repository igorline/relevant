let userDefaults;
let cookie;

if (process.env.WEB != 'true') {
  // userDefaults = require('react-native-user-defaults').default;
  userDefaults = require('react-native-swiss-knife').RNSKBucket;
} else {
  let Cookies = require('universal-cookie');
  cookie = new Cookies();
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
        console.log('userDefaults didn\'t find token');
        return reject();
      })
      .catch(err => reject(err));
    }
    // WEB
    let newToken = cookie.get('token', { path: '/' });
    if (newToken) {
      token = newToken;
      return resolve(token);
    }
    return reject();
  });
}

export function remove() {
  token = null;
  if (userDefaults) {
    return new Promise(resolve => {
      userDefaults.remove('token', APP_GROUP_ID);
      resolve();
    });
  }
  return new Promise(resolve => {
    cookie.remove('token', { path: '/' });
    console.log("REMOVED TOKEN ", cookie.get('token'));
    resolve();
  });
}

export function set(newToken) {
  token = newToken;
  if (userDefaults) {
    return new Promise(resolve => {
      userDefaults.set('token', newToken, APP_GROUP_ID);
      resolve();
    });
  }
  return new Promise(resolve => {
    cookie.set('token', token, { path: '/' });
    resolve();
  });
}

