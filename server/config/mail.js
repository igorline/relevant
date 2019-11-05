import htmlToText from 'html-to-text';
import MailGun from 'mailgun-js';

const dummyKey = 'XXXXXXXXXXXXXXXXXXXXXXX';
const { SYS_ADMIN_EMAIL } = process.env;

export const mailgun = MailGun({
  apiKey: process.env.MAILGUN_API_KEY || dummyKey,
  domain: process.env.MAILGUN_DOMAIN || dummyKey
});

export const test = () => {
  const data = {
    from: 'Relevant <noreply@mail.relevant.community>',
    to: 'slava@4real.io',
    subject: 'Message from relevant',
    text: 'Test message from relevant!'
  };
  exports.send(data);
};

export const sendEmail = data => {
  const text = htmlToText.fromString(data.html);
  data = { ...data, text };
  // console.log('env ', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  return mailgun
    .messages()
    .send(data)
    .catch(err => {
      // console.log('mail error ', err);
      throw err;
    });
};

export async function sendAdminAlert(err) {
  if (!SYS_ADMIN_EMAIL) return null;
  const data = {
    from: 'Relevant <info@relevant.community>',
    to: SYS_ADMIN_EMAIL,
    subject: `Error: ${err.message}`,
    html: `
      message: ${err.message}
      <br /><br />
      stack:
      <br />
      ${err.stack}
      <br />
      `
  };
  return sendEmail(data);
}

export default {
  send: sendEmail
};
