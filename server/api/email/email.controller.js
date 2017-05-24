import mail from '../../mail';
import Email from './email.model';
import Invite from '../invites/invite.model';

const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

async function generateList(type) {
  try {
    let query = { status: type };
    if (type === 'notregistered') {
      let now = new Date();
      now.setDate(now.getDate() - 5);
      query = { status: 'email sent', createdAt: { $lt: now } };
    }
    let users = await Invite.find(query);
    let list = mailgun.lists(type + '@mail.relevant.community');
    users.forEach(user => {
      let u = {
        subscribed: true,
        address: user.email,
        name: user.name,
        vars: { code: user.code },
      };
      list.members().create(u, function (err, data) {
        if (err) console.log(err);
        else console.log(data);
      });
    });
  } catch (err) {
    console.log(err);
  }
}

// generateList('registered');


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


function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

exports.validate = function (req, res, next) {
  let body = req.body;

  if (!mailgun.validateWebhook(body.timestamp, body.token, body.signature)) {
    console.error('Request came, but not from Mailgun');
    res.send({ error: { message: 'Invalid signature. Are you even Mailgun?' } });
    return;
  }

  next();
};

exports.index = async (req, res) => {
  let status;
  try {
    let email = req.body.email;
    let html = req.body.html;
    if (!email) throw new Error('no email');
    if (!html) throw new Error('no html');

    let data = {
      'o:tag': [req.body.campaign],
      from: 'Relevant <noreply@mail.relevant.community>',
      to: req.body.email,
      subject: 'Test subject',
      html
    };
    status = await mail.send(data);
  } catch (err) {
    handleError(res, err);
  }
  return res.status(200).json(status);
};

exports.save = async (req, res) => {
  try {
    await Email.find({}).remove();
    let draft = new Email(req.body);
    await draft.save();
  } catch (err) {
    handleError(res, err);
  }
  return res.sendStatus(200);
};

exports.load = async (req, res) => {
  let email;
  try {
    email = await Email.findOne({});
    console.log(email);
  } catch (err) {
    handleError(res, err);
  }
  return res.status(200).json(email);
};


