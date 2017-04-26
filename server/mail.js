
const htmlToText = require('html-to-text');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});


// mailgun.domains.updateTracking('mail.relevant.community', 'click', { active: true })
//   .then(msg => console.log(msg)) // logs response data
//   .catch(err => console.log(err)); // logs any error

exports.test = () => {
  let data = {
    from: 'Relevant <noreply@mail.relevant.community>',
    to: 'slava@4real.io',
    subject: 'Message from relevant',
    text: 'Test message from relevant!'
  };
  exports.send(data);
};

exports.send = data => {
  let text = htmlToText.fromString(data.html);
  data = { ...data, text };
  return mailgun.messages()
  .send(data)
  .catch(err => {
    // console.log('mail error ', err);
    throw err;
  });
};

exports.mailgun = mailgun;
