var request = require('superagent');
var FormData = require('form-data');

// Generates filename for S3 upload
function prepS3FileName(fileName) {
  var extension = fileName.substr(fileName.length - 4);
  var s3FileName = Math.random().toString(36).substr(2, 9) + "_" + extension;
  return s3FileName;
}

// Uploads image to S3 and adds url to post
export function addImage(image) {
  var s3FileName = prepS3FileName(image.name);
  return new Promise((resolve, reject) => {
    request
      .get('/api/s3/sign?s3_object_type=multipart/FormData&s3_object_name=' + s3FileName)
      .end(function(err, res) {
        if (err) return err;
        res = JSON.parse(res.text);
        var body = new FormData();
        body.append("key", s3FileName);
        body.append("AWSAccessKeyId", "AKIAJUARIDOFR6VZSEYA");
        body.append('acl', 'public-read');
        body.append("success_action_status", "201");
        body.append('Content-Type', 'image/jpeg');
        body.append('policy', res.signature.s3Policy);
        body.append('signature', res.signature.s3Signature);
        body.append('file', image);
        var url = res.url;
        var publicUrl = res.publicUrl;

        request
          .post(url)
          .send(body)
          .end(function(err, res) {
            if (err) reject(err);
            resolve(publicUrl);
          });
      });
  });
}

// Calls server to GET image from url and uploads it to s3, returns s3 url
export function addImageFromURL(imageURL) {
  var s3FileName = prepS3FileName(imageURL);
  // console.log(imageURL, 'imageURL');
  // console.log(s3FileName, 's3FileName');

  return new Promise((resolve, reject) => {
    request
      .get('/api/s3/uploadFromURL')
      .query({
        url: imageURL,
        fileName: s3FileName
      })
      .end(function(err, res) {
        if (err) {
          console.log(err, 'upload error');
          reject(err);
        } else {
          let newUrl = 'http://' + res.text;
          resolve(newUrl);
        }
      });
  });
}