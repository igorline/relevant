import { Alert } from 'app/utils/alert';

require('./api').env();

const S3_KEY = process.env.S3_KEY || 'AKIAJUARIDOFR6VZSEYA';

let RNFetchBlob;
let Platform = {};

if (process.env.WEB !== 'true') {
  Platform = require('react-native').Platform;
  if (Platform.OS === 'android') {
    RNFetchBlob = require('rn-fetch-blob').default;
  }
}

function isDataURL(s) {
  return !!s.match(isDataURL.regex);
}
// eslint-disable-next-line
isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  // separate out the mime component
  const mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0];

  // write the bytes of the string to a typed array
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}

async function uploadToS3(uri, policy, signature, url, publicUrl, signedObjectName) {
  const body = new FormData();

  try {
    if (Platform.OS === 'android' && (uri.match('http://') || uri.match('https://'))) {
      const res = await RNFetchBlob.config({
        fileCache: true,
        session: 'uploads'
      }).fetch('GET', uri);

      uri = 'file://' + res.path();
    }
  } catch (err) {
    Alert().alert('Error uploading image ', err);
  }

  let file = {
    uri,
    name: signedObjectName,
    type: 'image/jpeg'
  };

  if (isDataURL(uri)) {
    file = dataURItoBlob(uri);
  }

  body.append('key', signedObjectName);
  // TODO fetch this form the server?
  body.append('AWSAccessKeyId', S3_KEY);
  body.append('acl', 'public-read');
  body.append('success_action_status', '201');
  body.append('Content-Type', file.type);
  body.append('policy', policy);
  body.append('signature', signature);
  body.append('file', file);

  return fetch(url, {
    method: 'POST',
    body
  })
    .then(response => {
      if (Platform.OS === 'android') {
        RNFetchBlob.session('uploads').dispose();
        if (response.status === 201) {
          return { success: true, url: publicUrl };
        }
        return { success: false, response };
      }
      return { success: true, url: publicUrl };
    })
    .catch(error => {
      if (Platform.OS === 'android') {
        RNFetchBlob.session('uploads').dispose();
      }
      return { success: false, url: null, error };
    });
}

function executeOnSignedUrl(uri, fileName) {
  const extension = fileName || uri.substr(uri.length - 4);
  const signedPutUrl = process.env.API_SERVER + '/api/s3/sign';
  let signedObjectName = Math.random()
    .toString(36)
    .substr(2, 9);
  signedObjectName += '_' + extension;

  return fetch(
    signedPutUrl +
      '?s3_object_type=' +
      'multipart/form-data' +
      '&s3_object_name=' +
      signedObjectName,
    {
      credentials: 'include',
      method: 'GET'
    }
  )
    .then(response => response.json())
    .then(responseJSON =>
      uploadToS3(
        uri,
        responseJSON.signature.s3Policy,
        responseJSON.signature.s3Signature,
        responseJSON.url,
        responseJSON.publicUrl,
        signedObjectName
      )
    )
    .catch(error => ({ success: false, url: null, error }));
}

export function toS3Advanced(uri, fileName) {
  return executeOnSignedUrl(uri, fileName);
}
