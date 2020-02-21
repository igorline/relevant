import htmlToText from 'html-to-text';
import MailGun from 'mailgun-js';
import MailerLite from 'mailerlite-mailerlite';

const { SYS_ADMIN_EMAIL, RELEVANT_ENV } = process.env;
const IS_PRODUCTION = RELEVANT_ENV === 'production';

const ML = new MailerLite(process.env.MAILER_LITE_KEY, 2);
const ML_CONST = 'Groups';

const TEST_ID = '69351596';
const REGISTERED_USERS = '11298808';
const NO_DIGEST = '11349218';

const LISTS = {
  general: {
    mailgun: IS_PRODUCTION ? 'currentUsers' : 'test',
    ml: IS_PRODUCTION ? REGISTERED_USERS : TEST_ID
  },
  nodigest: {
    mailgun: IS_PRODUCTION ? 'nodigest' : 'test',
    ml: IS_PRODUCTION ? NO_DIGEST : TEST_ID
  }
};

const dummyKey = 'XXXXXXXXXXXXXXXXXXXXXXX';

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

export async function addUserToEmailList(user, _list) {
  user = await ensureEmail(user);
  const listParams = LISTS[_list || 'general'];
  try {
    await ML[ML_CONST].addSubscriber(listParams.ml, user.email, {
      name: '@' + user.handle
    });
  } catch (err) {
    // console.log('mailer lite err', er);
  }

  try {
    const list = mailgun.lists(listParams.mailgun + '@mail.relevant.community');

    const u = mailgunUser(user);
    if (!u) return null;

    return await handleRes(params => list.members().create(u, params));
  } catch (err) {
    return handleErr(err);
  }
}

export async function updateUserEmail(user, previousAddress, _list) {
  user = await ensureEmail(user);
  const listParams = LISTS[_list || 'general'];
  try {
    await ML[ML_CONST].deleteSubscriber(listParams.ml, previousAddress);
    await ML[ML_CONST].addSubscriber(listParams.ml, user.email, {
      name: '@' + user.handle
    });
  } catch (er) {
    // console.log('ml err', er);
  }

  try {
    const list = mailgun.lists(listParams.mailgun + '@mail.relevant.community');

    const u = mailgunUser(user);
    if (!u) return null;

    return await handleRes(params => list.members(previousAddress).update(u, params));
  } catch (err) {
    return handleErr(err);
  }
}

export async function removeFromEmailList(user, _list) {
  user = await ensureEmail(user);
  const listParams = LISTS[_list || 'general'];
  try {
    await ML[ML_CONST].deleteSubscriber(listParams.ml, user.email);
  } catch (er) {
    // console.log('ml err', er);
  }

  try {
    const list = mailgun.lists(listParams.mailgun + '@mail.relevant.community');
    return await handleRes(params => list.members(user.email).delete(params));
  } catch (err) {
    return handleErr(err);
  }
}

async function ensureEmail(user) {
  if (!user.email && user.ensureParam) return user.ensureParam('email');
  return user;
}

function mailgunUser(user) {
  const email = user.email || user.twitterEmail;
  if (!email) return null;
  return {
    subscribed: true,
    address: email.trim(),
    name: '@' + user.handle
  };
}

function handleErr(err) {
  console.log(err); // eslint-disable-line
  sendAdminAlert(err);
  return null;
}

function handleRes(fn) {
  return new Promise((resolve, reject) =>
    fn((err, data) => {
      if (err) return reject(err);
      return resolve(data);
    })
  );
}

export async function getMLUser(email) {
  return ML.Subscribers.getDetails(email);
}

export default {
  send: sendEmail
};
