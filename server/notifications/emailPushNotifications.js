const mail = require('server/config/mail');
const inlineCss = require('inline-css');
const { notificationStyle } = require('server/utils/emailStyle');
const User = require('server/api/user/user.model');
const { getUrls } = require('./notificationHelper');

// sendNotificationEmail({
//   commentor: { handle: 'commenter', name: 'Commentor' },
//   user: {
//     email: 'slava@relevant.community',
//     handle: 'test',
//     name: 'Test',
//     notificationSettings: { email: { replies: true } }
//   },
//   comment: {
//     body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,
//     sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
//     Ut enim ad minim veniam, quis nostrud
//     exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
//     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
//     dolore eu fugiat nulla pariatur.
//     Excepteur sint occaecat cupidatat non
//     proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
//     data: { community: 'relevant' },
//   }
// });

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
    return mail.send(data);
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
  const isPersonal = noteType === 'reply' || noteType === 'mention';
  if (isPersonal && toUser.notificationSettings.email.personal) {
    return true;
  }
  if (!isPersonal && toUser.notificationSettings.email.general) {
    return true;
  }
  return false;
}

// function getUrls({ post, fromUser, toUser }) {
//   const postId = post.parentPost ? post.parentPost._id || post.parentPost : post._id;
//   const replyIdSting = post.parentPost ? `/${post._id}` : '';
//   const userUrl = `${process.env.API_SERVER}/user/profile/${fromUser.handle}`;
//   const postUrl = `${process.env.API_SERVER}/${
//     post.data.community
//   }/post/${postId}${replyIdSting}`;
//   const settingsUrl = `${process.env.API_SERVER}/user/profile/${toUser.handle}/settings`;
//   return { userUrl, postUrl, settingsUrl };
// }

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
        ${post.body}
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
