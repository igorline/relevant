require('./fetchUtils').env();
let RNFetchBlob;
let Platform;

if (process.env.WEB != 'true') {
  RNFetchBlob = require('react-native-fetch-blob').default;
  Platform = require('react-native').Platform;
}

function executeOnSignedUrl(uri) {
  console.log(uri, 'uri');
  let extension = uri.substr(uri.length - 4);
  let s3_sign_put_url = process.env.API_SERVER + '/api/s3/sign';
  let s3_object_name = Math.random().toString(36).substr(2, 9) + '_' + extension;

  return fetch(s3_sign_put_url + '?s3_object_type=' + 'multipart/form-data' + '&s3_object_name=' + s3_object_name, {
    credentials: 'include',
    method: 'GET',
  })
  .then((response) => response.json())
  .then((responseJSON) => {
    // console.log(responseJSON, 'execute on signed url response');
    return uploadToS3(uri, responseJSON.signature.s3Policy, responseJSON.signature.s3Signature, responseJSON.url, responseJSON.publicUrl, s3_object_name);
  })
  .catch((error) => {
    console.log(error, 'error');
    return { success: false, url: null };
  });
};

async function uploadToS3(uri, policy, signature, url, publicUrl, s3_object_name) {
  let body = new FormData();

  try {
    if (Platform.OS === 'android' && uri.match('http//') || uri.match('https://')) {
      let res = await RNFetchBlob
      .config({
        fileCache: true,
        session: 'uploads'
      })
      .fetch('GET', uri);

      uri = 'file://' + res.path();
    }
  } catch (err) {
    console.log(err);
  }

  body.append('key', s3_object_name);
  body.append('AWSAccessKeyId', 'AKIAJUARIDOFR6VZSEYA');
  body.append('acl', 'public-read');
  body.append('success_action_status', '201');
  body.append('Content-Type', 'image/png');
  body.append('policy', policy);
  body.append('signature', signature);
  body.append('file', {
    uri,
    name: s3_object_name,
    type: 'image/jpeg'
  });

  return fetch(url, {
    method: 'POST',
    body
  })
  .then((response) => {
    RNFetchBlob.session('uploads').dispose();
    if (response.status === 201) {
      return { success: true, url: publicUrl };
    }
    return { success: false, response };
  })
  .catch((error) => {
    console.log(error, 'error');
    RNFetchBlob.session('uploads').dispose();
    return { success: false, url: null };
  });
}

export function toS3Advanced(uri) {
  return executeOnSignedUrl(uri);
}
