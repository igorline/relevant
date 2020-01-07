import List from 'server/api/emailList/list.model';
import { mailgun, sendEmail } from 'server/utils/mail';
import Email from './email.model';
import Invite from '../invites/invite.model';
import User from '../user/user.model';

const inlineCss = require('inline-css');
const { emailStyle } = require('../../utils/emailStyle');

// const unsub = [
//   'jasonfeifer@gmail.com',
//   'nikitanaggarwal@gmail.com',
//   'samseurynck@gmail.com',
//   'adrianzorz@gmail.com',
//   'disinfeqt@gmail.com',
//   'mattf96@gmail.com'
// ];

// async function removeUnsubscribed() {
//   await Invite.find({ email: { $in: unsub } }).remove();
// }

/* eslint no-console: 0 */

// eslint-disable-next-line
async function generateList(type) {
  try {
    let query;
    let users;
    if (type === 'notregistered') {
      const now = new Date();
      // now.setDate(now.getDate() - 5);
      query = { status: 'email sent', createdAt: { $lt: now } };
      users = await Invite.find(query);

      // const now = new Date();
      // now.setDate(now.getDate() - 5);
      query = { status: { $exists: false } };
      const waitlist = await List.find(query);
      users = [...users, ...waitlist];
    } else if (type === 'currentUsers') {
      const now = new Date();
      // now.setDate(now.getDate() - 5);
      query = { createdAt: { $lt: now } };
      users = await User.find(query, 'email code twitterEmail twitter handle name');
    } else if (type === 'waitlist') {
      // const now = new Date();
      // now.setDate(now.getDate() - 5);
      query = { status: { $exists: false } };
      users = await List.find(query);
    } else if (type === 'nodigest') {
      // const now = new Date();
      // now.setDate(now.getDate() - 5);
      query = { 'notificationSettings.email.digest': false };
      users = await User.find(query, 'email code twitterEmail twitter handle name');
      console.log('nodigest', users.length);
    }

    const list = mailgun.lists(type + '@mail.relevant.community');

    users.forEach(async user => {
      let vars = {};
      if (type === 'notregistered') {
        vars = { code: user.code };
      }

      // if (!user.email && !user.twitterEmail) console.log(user.toObject());

      if (type === 'notregistered' || type === 'waitlist') {
        let remove = await User.findOne({
          $or: [{ email: user.email }, { twitterEmail: user.email }]
        });
        if (type === 'waitlist') {
          remove =
            (await Invite.findOne({ email: user.email, status: 'email sent' })) || remove;
        }

        if (remove) {
          console.log('remove', user.email);
          list.members(user.email).delete();
          return;
        }
      }
      // return;

      const u = {
        subscribed: true,
        address: user.email || user.twitterEmail,
        name:
          type === 'notregistered' || type === 'waitlist' ? user.name : '@' + user.handle,
        vars
      };
      if (u.address) {
        u.address = u.address.trim();
      }

      console.log('handle', user.handle, u.name, u.address);
      if (!u.address) return;
      list.members().create(u, err => {
        if (err) {
          try {
            list.members(u.address).update(u, console.log);
          } catch (error) {
            console.log('err updating', u);
          }
        }
        // console.log
      });
    });
  } catch (err) {
    console.log(err);
    // throw err;
  }
}

// generateList('nodigest');
// generateList('currentUsers');
// generateList('notregistered');
// generateList('waitlist');

// mailgun.lists().create({
//   address: 'test1@mail.relevant.community',
//   name: 'test1',
//   description: 'Users that have invites but have not registered',
// });
// let list = mailgun.lists('test@mail.relevant.community');
// let slava = {
//   subscribed: true,
//   address: 'byslava@gmail.com',
//   name: 'Slava',
//   vars: { code: 'xyDFz' },
// };
// list.members().create(slava, err => {
//   if (err) throw err;
// });
// let analisa = {
//   subscribed: 'true',
//   address: 'analisa@4real.io',
//   name: 'Analisa',
//   vars: { code: 'fsdflkj' },
// };
// list.members('byslava@gmail.com').update(slava, function (err, data) {
//   // `data` is the member details
//   console.log(data);
//   console.log(err);
// });
// list.members('analisa@4real.io').update(analisa, function (err, data) {
//   // `data` is the member details
//   console.log(data);
//   console.log(err);
// });

// list.members().list(function (err, members) {
//   // `members` is the list of members
//   console.log(members);
// });

// list.members('byslava@gmail.com').delete(function (err, body) {
//   console.log(body);
// });
//

// need this?
exports.validate = function validate(req, res, next) {
  const { body } = req;
  if (!mailgun.validateWebhook(body.timestamp, body.token, body.signature)) {
    res.send({ error: { message: 'Invalid signature. Are you even Mailgun?' } });
    return;
  }
  next();
};

exports.index = async (req, res, next) => {
  try {
    const { email } = req.body;
    let html = emailStyle + req.body.html;

    html = await inlineCss(html, { url: 'https://relevant.community' });

    if (!email) throw new Error('no email');
    if (!html) throw new Error('no html');

    const data = {
      'o:tag': [req.body.campaign],
      from: 'Relevant <info@relevant.community>',
      to: req.body.email,
      subject: req.body.subject,
      html
    };
    const status = await sendEmail(data);
    return res.status(200).json(status);
  } catch (err) {
    return next(err);
  }
};

exports.save = async (req, res, next) => {
  try {
    await Email.find({}).remove();
    const draft = new Email(req.body);
    await draft.save();
    return res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
};

exports.load = async (req, res, next) => {
  try {
    const email = await Email.findOne({});
    return res.status(200).json(email);
  } catch (err) {
    return next(err);
  }
};
