require('./api').env();
let RNFetchBlob;
let Platform = {};

if (process.env.WEB != 'true') {
  Platform = require('react-native').Platform;
  if (Platform.OS === 'android') {
    RNFetchBlob = require('react-native-fetch-blob').default;
  }
}

function isDataURL(s) {
  return !!s.match(isDataURL.regex);
}
isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;


function executeOnSignedUrl(uri, fileName) {
  let extension = fileName || uri.substr(uri.length - 4);
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

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  // separate out the mime component
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}

// function dataURItoBlob(dataURI) {
//   const binary = atob(dataURI.split(',')[1]);
//   let array = [];
//   for (let i = 0; i < binary.length; i++) {
//     array.push(binary.charCodeAt(i));
//   }
//   return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
// }

async function uploadToS3(uri, policy, signature, url, publicUrl, s3_object_name) {
  let body = new FormData();

  try {
    if (Platform.OS === 'android' && (uri.match('http://') || uri.match('https://'))) {
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

  let file = {
    uri,
    name: s3_object_name,
    type: 'image/jpeg'
  };

  if (isDataURL(uri)) {
    file = dataURItoBlob(uri);
  }


  body.append('key', s3_object_name);
  body.append('AWSAccessKeyId', 'AKIAJUARIDOFR6VZSEYA');
  body.append('acl', 'public-read');
  body.append('success_action_status', '201');
  body.append('Content-Type', file.type);
  body.append('policy', policy);
  body.append('signature', signature);
  body.append('file', file);

  console.log(body);
  console.log(file);

  return fetch(url, {
    method: 'POST',
    body
  })
  .then((response) => {
    if (Platform.OS === 'android') {
      RNFetchBlob.session('uploads').dispose();
      if (response.status === 201) {
        return { success: true, url: publicUrl };
      }
      return { success: false, response };
    }
    return { success: true, url: publicUrl };
  })
  .catch((error) => {
    console.log(error, 'error');
    if (Platform.OS === 'android') {
      RNFetchBlob.session('uploads').dispose();
    }
    return { success: false, url: null };
  });
}

export function toS3Advanced(uri, fileName) {
  return executeOnSignedUrl(uri, fileName);
}
