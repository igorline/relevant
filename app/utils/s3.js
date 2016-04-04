export
function toS3Advanced(uri, type, user, token) {
  return executeOnSignedUrl(uri, type, user, token);
}

function executeOnSignedUrl(uri, type, user, token) {
  var s3_sign_put_url = 'http://localhost:3000/api/s3/sign';
   var s3_object_name = Math.random().toString(36).substr(2, 9) + "_" + '.jpg';

  return fetch(s3_sign_put_url + '?s3_object_type=' + 'multipart/FormData' + '&s3_object_name=' + s3_object_name, {
      credentials: 'include',
      method: 'GET',
  })
  .then((response) => response.json())
  .then((responseJSON) => {
      console.log(responseJSON, 'execute on signed url response');
      return uploadToS3(uri, responseJSON.signature.s3Policy, responseJSON.signature.s3Signature, responseJSON.url, responseJSON.publicUrl, type, user, token, s3_object_name);
  })
  .catch((error) => {
      console.log(error, 'error');
  });
};

function uploadToS3(uri, policy, signature, url, publicUrl, type, user, token, s3_object_name) {
  var body = new FormData();
  body.append("key", s3_object_name)
  body.append("AWSAccessKeyId", "AKIAIN6YT3LQ4EMODDQA")
  body.append('acl', 'public-read')
  body.append("success_action_status", "201")
  body.append('Content-Type', 'image/jpeg')
  body.append('policy', policy)
  body.append('signature', signature)
  body.append('file', {
      uri: uri,
      name: s3_object_name
  })
  return fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'multipart/FormData'
      },
      body: body
  })
  .then((response) => {
      if (response.status == 201) {
        return {'success': true, 'url': publicUrl};
      } else {
        return {'success': false, 'url': publicUrl};
      }
  })
  .catch((error) => {
    console.log(error, 'error')
     return {'success': false, 'url': null};
  });
};

