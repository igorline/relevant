let userDefaults;
let cookie;
let localStorage;

if (process.env.WEB !== 'true') {
  userDefaults = require('react-native-swiss-knife').RNSKBucket;
} else {
  const Cookies =
    process.env.BROWSER && process.env.NODE_ENV !== 'test'
      ? require('universal-cookie').default
      : require('universal-cookie');
  cookie = new Cookies();
  if (process.env.BROWSER) localStorage = window.localStorage;
}

const APP_GROUP_ID = 'group.com.4real.relevant';

let token;

export const local = localStorage;

export function get(key) {
  return new Promise((resolve, reject) => {
    if (userDefaults) {
      return userDefaults
        .get(key, APP_GROUP_ID)
        .then(val => {
          if (val) {
            return resolve(val);
          }
          return resolve(null);
        })
        .catch(err => reject(err));
    }
    // WEB
    const val = cookie.get(key, { path: '/' });
    if (val) {
      return resolve(val);
    }
    return resolve(null);
  });
}

export function remove(key) {
  if (userDefaults) {
    return new Promise(resolve => {
      userDefaults.remove(key, APP_GROUP_ID);
      resolve();
    });
  }
  return new Promise(resolve => {
    cookie.remove(key, { path: '/' });
    resolve();
  });
}

export function set(key, val) {
  if (userDefaults) {
    return new Promise(resolve => {
      userDefaults.set(key, String(val), APP_GROUP_ID);
      resolve();
    });
  }
  return new Promise(resolve => {
    cookie.set(key, val, { path: '/' });
    resolve();
  });
}

export function getToken() {
  return new Promise((resolve, reject) => {
    if (token) return resolve(token);

    if (userDefaults) {
      return userDefaults
        .get('token', APP_GROUP_ID)
        .then(newToken => {
          if (newToken) {
            token = newToken;
            return resolve(token);
          }
          return resolve(null);
        })
        .catch(err => reject(err));
    }
    // WEB
    const newToken = cookie.get('token', { path: '/' });
    if (newToken) {
      token = newToken;
      return resolve(token);
    }
    return resolve(token);
    // reject(new Error('not logged in'));
  });
}

export const setToken = async newToken => {
  token = newToken;
  set('token', newToken);
};
export const removeToken = async () => {
  token = null;
  console.log('REMOVING TOKEN!'); // eslint-disable-line
  remove('token');
};

// Expects unix timecode
const isTimecodeExpired = (date, days) => {
  const now = new Date().getTime();
  const diff = Math.abs(now - Number(date));
  const ONE_DAY = 1000 * 60 * 60 * 24;
  return diff > days * ONE_DAY;
};

export const isDismissed = async (key, days) => {
  let dismissed;
  try {
    dismissed = await get(key);
  } catch (err) {
    return false;
  }
  if (!dismissed) {
    return false;
  }
  if (isTimecodeExpired(Number(dismissed), days)) {
    remove(key);
    return false;
  }
  return true;
};
