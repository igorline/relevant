const aws = require('aws-sdk');
const crypto = require('crypto');

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET } = process.env;

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
    publicUrl: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + req.query.s3_object_name,
    AWS_ACCESS_KEY
  };
  res.write(JSON.stringify(returnData));
  res.end();
};
