require('./fetchUtils').env();

export
function toS3Advanced(uri) {
  return executeOnSignedUrl(uri);
}

function executeOnSignedUrl(uri) {
  console.log(uri, 'uri');
  var extension = uri.substr(uri.length - 4);
  var s3_sign_put_url = process.env.API_SERVER+'/api/s3/sign';
  var s3_object_name = Math.random().toString(36).substr(2, 9) + "_" + extension;

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
  var body = new FormData();
  body.append("key", s3_object_name);
  body.append("AWSAccessKeyId", "AKIAJUARIDOFR6VZSEYA");
  body.append('acl', 'public-read');
  body.append("success_action_status", "201");
  body.append('Content-Type', 'image/jpeg');
  body.append('policy', policy);
  body.append('signature', signature);
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
        return { success: true, url: publicUrl };
      } else {
        return { success: false, response };
      }
  })
  .catch((error) => {
    console.log(error, 'error');
    return { 'success': false, 'url': null };
  });
};

