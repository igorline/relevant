import htmlToText from 'html-to-text';
import MailGun from 'mailgun-js';
import MailerLite from 'mailerlite-mailerlite';

const dummyKey = 'XXXXXXXXXXXXXXXXXXXXXXX';
const { SYS_ADMIN_EMAIL, RELEVANT_ENV } = process.env;

const ML = new MailerLite(process.env.MAILER_LITE_KEY, 2);
const ML_CONST = 'Groups';

const TEST_ID = '69351596';
const REGISTERED_USERS = '11298808';
const ML_GROUP_ID =
  process.env.RELEVANT_ENV === 'production' ? REGISTERED_USERS : TEST_ID;

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

export async function addUserToEmailList(user) {
  try {
    await ML[ML_CONST].addSubscriber(ML_GROUP_ID, user.email, {
      name: '@' + user.handle
    });
  } catch (er) {
    // console.log('mailer lite err', er);
  }

  try {
    const type = RELEVANT_ENV === 'production' ? 'currentUsers' : 'test';
    const list = mailgun.lists(type + '@mail.relevant.community');

    const u = {
      subscribed: true,
      address: user.email || user.twitterEmail,
      name: '@' + user.handle
    };

    if (u.address) u.address = u.address.trim();
    else return null;

    return new Promise(resolve =>
      list.members().create(u, (err, data) => {
        if (err) {
          console.log('error adding user to email list', user.handle, err); // eslint-disable-line
          sendAdminAlert(err);
          return resolve(null);
        }
        return resolve(data);
      })
    );
  } catch (err) {
    console.log(err); // eslint-disable-line
    return null;
  }
}

export async function updateUserEmail(user, previousAddress) {
  try {
    await ML[ML_CONST].deleteSubscriber(ML_GROUP_ID, previousAddress);
    await ML[ML_CONST].addSubscriber(ML_GROUP_ID, user.email, {
      name: '@' + user.handle
    });
  } catch (er) {
    // console.log('ml err', er);
  }

  try {
    const type = RELEVANT_ENV === 'production' ? 'currentUsers' : 'test';
    const list = mailgun.lists(type + '@mail.relevant.community');

    const u = {
      subscribed: true,
      address: user.email || user.twitterEmail,
      name: '@' + user.handle
    };

    if (u.address) u.address = u.address.trim();
    else return null;

    return new Promise(resolve =>
      list.members(previousAddress).update(u, (err, data) => {
        if (err) {
          console.log(err); // eslint-disable-line
          sendAdminAlert(err);
          return resolve(null);
        }
        return resolve(data);
      })
    );
  } catch (err) {
    console.log(err); // eslint-disable-line
    return null;
  }
}

export async function removeFromEmailList(user) {
  try {
    await ML[ML_CONST].deleteSubscriber(ML_GROUP_ID, user.email);
  } catch (er) {
    // console.log('ml err', er);
  }

  try {
    const type = RELEVANT_ENV === 'production' ? 'currentUsers' : 'test';
    const list = mailgun.lists(type + '@mail.relevant.community');

    return new Promise(resolve =>
      list.members(user.email).delete((err, data) => {
        if (err) {
          console.log(err); // eslint-disable-line
          sendAdminAlert(err);
          return resolve(null);
        }
        return resolve(data);
      })
    );
  } catch (err) {
    console.log(err); // eslint-disable-line
    return null;
  }
}

export async function getMLUser(email) {
  return ML.Subscribers.getDetails(email);
}

export default {
  send: sendEmail
};
