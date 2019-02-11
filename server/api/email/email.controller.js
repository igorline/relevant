import mail from '../../mail';
import Email from './email.model';
import Invite from '../invites/invite.model';
import User from '../user/user.model';

const dummyKey = 'XXXXXXXXXXXXXXXXXXXXXXX';

const inlineCss = require('inline-css');
const { emailStyle } = require('../../utils/emailStyle');

const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY || dummyKey,
  domain: process.env.MAILGUN_DOMAIN || dummyKey
});

/* eslint no-console: 0 */

// eslint-disable-next-line
async function generateList(type) {
  try {
    let query;
    let users;
    if (type === 'notregistered') {
      const now = new Date();
      now.setDate(now.getDate() - 5);
      query = { status: 'email sent', createdAt: { $lt: now } };
      users = await Invite.find(query);
    } else if (type === 'registered') {
      const now = new Date();
      now.setDate(now.getDate() - 5);
      query = { createdAt: { $lt: now } };
      users = await User.find(query, 'email code twitterEmail twitter');
    }

    try {
      const oldList = mailgun.lists(type + '@mail.relevant.community');

      // clear old list (needs to run a few times because only returns 100 at a time)
      // list.members().list(function(err, members) {
      //   members.items.forEach(m => {
      //     console.log(m);
      //     list.members(m.address).delete();
      //   });
      // });
      await oldList.delete();
    } catch (err) {
      console.log(err);
    }

    let list = await mailgun.lists().create({
      address: type + '@mail.relevant.community',
      name: type,
      description: type
    });
    list = mailgun.lists(type + '@mail.relevant.community');

    users.forEach(user => {
      let vars = {};
      if (type === 'notregistered') {
        vars = { code: user.code };
      }
      if (!user.email) {
        console.log(user);
      }
      const u = {
        subscribed: true,
        address: user.email || user.twitterEmail,
        name: type === 'notregistered' ? user.name : '@' + user._id,
        vars
      };
      list.members().create(u, err => {
        if (err) throw err;
      });
    });
  } catch (err) {
    throw err;
  }
}

// mailgun.lists().create({
//   address: 'test1@mail.relevant.community',
//   name: 'test1',
//   description: 'Users that have invites but have not registered',
// });

// generateList('registered');
// generateList('notregistered');

// let list = mailgun.lists('test@mail.relevant.community');
// let slava = {
//   subscribed: 'true',
//   address: 'byslava@gmail.com',
//   name: 'Slava',
//   vars: { code: 'xyDFz' },
// };
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
      from: 'Relevant <noreply@mail.relevant.community>',
      to: req.body.email,
      subject: req.body.subject,
      html
    };
    const status = await mail.send(data);
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
