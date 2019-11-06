const { sendEmail } = require('server/utils/mail');
const inlineCss = require('inline-css');
const { notificationStyle } = require('server/utils/emailStyle');
const User = require('server/api/user/user.model');
const { getUrls } = require('./notificationHelper');

export async function handleEmailNotifications(params) {
  try {
    params.toUser = await ensureUserEamil(params.toUser);
    if (!params.toUser) return null;
    if (!emailNotificationIsEnabled(params)) return null;

    const { html, subject } = await getHtml(params);

    const data = {
      from: 'Relevant <info@relevant.community>',
      to: params.toUser.email,
      subject,
      html
    };
    return sendEmail(data);
  } catch (err) {
    return console.log(err); // eslint-disable-line
  }
}

async function getHtml(params) {
  params.urls = getUrls(params);
  const { noteType } = params;
  switch (noteType) {
    case 'newPost':
      return getNewPostHtml(params);
    case 'reward':
      return getRewardHtml(params);
    default:
      return getDefaultEmailHtml(params);
  }
}

async function ensureUserEamil(user) {
  if (user.email && user.notificationSettings) return user;
  user = await User.findOne({ _id: user._id }, '+email');
  if (!user.email) throw new Error('user is missing email');
  return user;
}

function emailNotificationIsEnabled({ noteType, toUser }) {
  const isPersonal =
    noteType === 'reward' || noteType === 'reply' || noteType === 'mention';
  if (isPersonal && toUser.notificationSettings.email.personal) {
    return true;
  }
  if (!isPersonal && toUser.notificationSettings.email.general) {
    return true;
  }
  return false;
}

async function getDefaultEmailHtml({ urls, fromUser, post, toUser, action, noteType }) {
  const { userUrl, postUrl, settingsUrl } = urls;

  const noteHtml = fromUser
    ? `<a href="${userUrl}">${fromUser.name}</a> ${action}`
    : action;
  const subject = fromUser ? `${fromUser.name} ${action}` : action;

  const isReplyOrMention = noteType === 'reply' || noteType === 'mention';

  let html = `
    <br/>
    ${toUser.name}, ${isReplyOrMention ? 'you have a new notification' : noteHtml}:
    <br />
    <br />
    <div class="post" />
      ${isReplyOrMention ? '<div class="head">' + noteHtml + '</div>' : ''}
      <a class="body" href="${postUrl}">
        ${post.body || post.title}
      </a>
    </div>
    <br />
    <br />
    <p class='footer'>You can adjust your email notification settings <a href="${settingsUrl}">here</a></p>
    `;

  html = await inlineCss(notificationStyle + html, { url: 'https://relevant.community' });

  return { html, subject };
}

async function getNewPostHtml({ urls, fromUser, toUser, action, community }) {
  const { userUrl, postUrl, settingsUrl } = urls;

  const fromHtml = `<a href="${userUrl}">${fromUser.name}</a>`;
  const postHtml = `<a href="${postUrl}">post</a>`;

  const noteHtml = `there is a new ${postHtml} from ${fromHtml} in the ${community} community`;
  const subject = action;

  let html = `
    <br/>
    ${toUser.name}, ${noteHtml}
    <br />
    <br />
    <p class='footer'>You can adjust your email notification settings <a href="${settingsUrl}">here</a></p>
    `;

  html = await inlineCss(notificationStyle + html, { url: 'https://relevant.community' });
  return { html, subject };
}

async function getRewardHtml({ urls, toUser, action }) {
  const { postUrl, settingsUrl } = urls;

  const walletUrl = `${process.env.API_SERVER}/user/wallet`;

  const postHtml = `<a href="${postUrl}">post</a>`;
  const noteHtml = action.toLowerCase().replace('post', postHtml);
  const subject = action;

  let html = `
    <br/>
    ${toUser.name}, ${noteHtml}
    <br />
    <br />
    You can see all of your earnings in your <a href="${walletUrl}">wallet</a>.
    <br />
    <br />
    <p class='footer'>You can adjust your email notification settings <a href="${settingsUrl}">here</a></p>
    `;

  html = await inlineCss(notificationStyle + html, { url: 'https://relevant.community' });
  return { html, subject };
}
