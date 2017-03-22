
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

exports.test = () => {
  let data = {
    from: 'Relevant <noreply@mail.relevant.community>',
    to: 'slava@4real.io',
    subject: 'Message from relevant',
    text: 'Test message from relevant!'
  };
  exports.send(data);
};

exports.send = data =>
  mailgun.messages()
  .send(data)
  .catch(err => {
    // console.log('mail error ', err);
    throw err;
  });

exports.mailgun = mailgun;
