const aws = require('aws-sdk');
const s3 = require('s3');
const crypto = require('crypto');
const request = require('request');

// Creates a new s3 in the DB.
const { AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET } = process.env;

const client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  }
});

exports.upload = (req, res) => {
  const extension = req.body.file.substr(req.body.file.length - 4);
  const random = Math.floor(Math.random() * (9999999999 - 0 + 1)) + 0 + extension;
  const params = {
    localFile: req.body.file,

    s3Params: {
      Bucket: S3_BUCKET,
      Key: random
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    }
  };
  const uploader = client.uploadFile(params);
  uploader.on('error', err => {
    console.error('unable to upload:', err.stack); // eslint-disable-line
  });
  uploader.on('progress', () => {
    // eslint-disable-next-line
    console.log(
      'progress',
      uploader.progressMd5Amount,
      uploader.progressAmount,
      uploader.progressTotal
    );
  });
  uploader.on('end', () => {
    res.status(200).send({ filename: random });
  });
};

exports.sign = (req, res) => {
  aws.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });

  const s3Policy = {
    expiration: '2024-12-01T12:00:00.000Z', // hard coded for testing
    conditions: [
      ['starts-with', '$key', ''],
      { bucket: S3_BUCKET },
      { acl: 'public-read' },
      ['starts-with', '$Content-Type', ''],
      { success_action_status: '201' }
    ]
  };

  // stringify and encode the policy
  const stringPolicy = JSON.stringify(s3Policy);
  const base64Policy = Buffer.from(stringPolicy, 'utf-8').toString('base64');

  // sign the base64 encoded policy
  const signature = crypto
  .createHmac('sha1', AWS_SECRET_KEY)
  .update(Buffer.from(base64Policy, 'utf-8'))
  .digest('base64');

  // build the results object
  const s3Credentials = {
    s3Policy: base64Policy,
    s3Signature: signature
  };

  const returnData = {
    signature: s3Credentials,
    url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/',
    publicUrl: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + req.query.s3_object_name
  };
  res.write(JSON.stringify(returnData));
  res.end();
};

// Gets image binary from given URL and uploads it to s3
exports.uploadFromURL = (req, response) => {
  aws.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });
  const s3Instance = new aws.S3();

  function grabFromURL(url) {
    return new Promise((resolve, reject) => {
      request(
        {
          url,
          encoding: null
        },
        (err, res, body) => {
          if (err) reject(err);
          const returnObj = {
            res,
            body
          };
          resolve(returnObj);
        }
      );
    });
  }

  function uploadBinary(res, body, bucket, key) {
    const putObjectPromise = s3Instance
    .putObject({
      Bucket: bucket,
      Key: key,
      ContentType: res.headers['content-type'],
      ContentLength: res.headers['content-length'],
      Body: body // buffer
    })
    .promise();

    putObjectPromise
    .then(() => {
      response.send(200, S3_BUCKET + '.s3.amazonaws.com/' + req.query.fileName);
    })
    .catch(err => {
      response.send(500, err);
    });
  }

  grabFromURL(req.query.url).then(
    returnObj => {
      uploadBinary(returnObj.res, returnObj.body, S3_BUCKET, req.query.fileName);
    },
    err => {
      response.send(500, err);
    }
  );
};
