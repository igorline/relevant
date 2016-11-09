import userDefaults from 'react-native-user-defaults';

const APP_GROUP_ID = 'group.com.4real.relevant';

let token;

export function get() {
  return new Promise((resolve, reject) => {

    console.log(token);
    if (token) return resolve(token);

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
  });
}

export function remove() {
  token = null;
  return userDefaults.remove('token', APP_GROUP_ID);
}

export function set(newToken) {
  token = newToken;
  return userDefaults.set('token', newToken, APP_GROUP_ID);
}

