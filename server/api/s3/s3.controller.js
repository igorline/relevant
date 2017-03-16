'use strict';

var _ = require('lodash');
var aws = require('aws-sdk');
var s3 = require('s3');
var multiparty = require('multiparty');
var crypto = require("crypto");
var request = require('request');

// Creates a new s3 in the DB.
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

exports.upload = function(req, res) {
  var extension = req.body.file.substr(req.body.file.length - 4);
  var random = (Math.floor(Math.random() * (9999999999 - 0 + 1)) + 0)+extension;
  var params = {
    localFile: req.body.file,

    s3Params: {
      Bucket: S3_BUCKET,
      Key: random,
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };
  var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
  });
  uploader.on('progress', function() {
    console.log("progress", uploader.progressMd5Amount,
        uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function(data) {
    console.log(data, "done uploading");
    res.status(200).send({"filename": random});
  });

};


exports.sign = function(req, res) {
  aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
  var date = new Date();

  var s3Policy = {
    "expiration": "2024-12-01T12:00:00.000Z", // hard coded for testing
    "conditions": [
      ["starts-with", "$key", ""],
      {"bucket": S3_BUCKET},
      {"acl": "public-read"},
      ["starts-with", "$Content-Type", ""],
      {"success_action_status" : "201" }
    ]
  };

  // stringify and encode the policy
  var stringPolicy = JSON.stringify(s3Policy);
  var base64Policy = Buffer(stringPolicy, "utf-8").toString("base64");

  // sign the base64 encoded policy
  var signature = crypto.createHmac("sha1", AWS_SECRET_KEY)
    .update(new Buffer(base64Policy, "utf-8")).digest("base64");

  // build the results object
  var s3Credentials = {
    s3Policy: base64Policy,
    s3Signature: signature
  };

 var return_data = {
    signature: s3Credentials,
    url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/',
    publicUrl: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.s3_object_name
  };
  console.log(return_data)
  res.write(JSON.stringify(return_data));
  res.end();
};

// Gets image binary from given URL and uploads it to s3
exports.uploadFromURL = function(req, response) {
  aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
  var s3 = new aws.S3();

  function grabFromURL(url) {
    return new Promise((resolve, reject) => {
      request({
        url: url,
        encoding: null
      }, function(err, res, body) {
        if (err) reject(err);
        var returnObj = {
          res: res,
          body: body
        };
        resolve(returnObj);
      });
    });
  }

  function uploadBinary(res, body, bucket, key) {
    var putObjectPromise = s3.putObject({
      Bucket: bucket,
      Key: key,
      ContentType: res.headers['content-type'],
      ContentLength: res.headers['content-length'],
      Body: body // buffer
    }).promise();

    putObjectPromise.then(function(data) {
      response.send(200, S3_BUCKET + '.s3.amazonaws.com/' + req.query.fileName);
    }).catch(function(err) {
      response.send(500, err);
    });
  }

  grabFromURL(req.query.url).then(function(returnObj) {
    uploadBinary(returnObj.res, returnObj.body, S3_BUCKET, req.query.fileName);
  }, function(err) {
    response.send(500, err);
  });
};


function handleError(res, err) {
    return res.send(500, err);
}
