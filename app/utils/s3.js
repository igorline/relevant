require('./fetchUtils').env();


function executeOnSignedUrl(uri) {
  console.log(uri, 'uri');
  let extension = uri.substr(uri.length - 4);
  let s3_sign_put_url = process.env.API_SERVER + '/api/s3/sign';
  let s3_object_name = Math.random().toString(36).substr(2, 9) + '_' + extension;

  return fetch(s3_sign_put_url + '?s3_object_type=' + 'multipart/FormData' + '&s3_object_name=' + s3_object_name, {
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
  });
};

function uploadToS3(uri, policy, signature, url, publicUrl, s3_object_name) {
  let body = new FormData();
  body.append('key', s3_object_name);
  body.append('AWSAccessKeyId', 'AKIAJUARIDOFR6VZSEYA');
  body.append('acl', 'public-read');
  body.append('success_action_status', '201');
  body.append('Content-Type', 'image/jpeg');
  body.append('policy', policy);
  body.append('signature', signature);
  body.append('file', {
    uri,
    name: s3_object_name
  });
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/FormData'
    },
    body
  })
  .then((response) => {
    if (response.status === 201) {
      return { success: true, url: publicUrl };
    }
    return { success: false, response };
  })
  .catch((error) => {
    console.log(error, 'error');
    return { success: false, url: null };
  });
}

export function toS3Advanced(uri) {
  return executeOnSignedUrl(uri);
}
