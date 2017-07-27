import mongoose from 'mongoose';
import voucherCodes from 'voucher-code-generator';
import mail from '../../mail';

const Schema = mongoose.Schema;

let InviteSchema = new Schema({
  email: { type: String },
  name: { type: String },
  code: { type: String, index: true },
  redeemed: { type: Boolean, default: false },
  number: { type: Number, default: 1 },
  status: { type: String },
  invitedBy: { type: String, ref: 'User' },
  registeredAs: { type: String, ref: 'User' },
  invitedByString: { type: String }
}, {
  timestamps: true
});


async function sendInviteCodes(user, codes) {
  let status;
  let codesString = '<b>' + codes.join('<br />') + '</b>';
  try {
    let appStoreUrl = 'https://itunes.apple.com/us/app/relevant-a-social-news-reader/id1173025051';
    // let url = `${process.env.API_SERVER}/invite/${invite.code}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: user.email,
      subject: 'Invitation Codes!',
      html: `If you know a thought leader who posesses valuable information, send them one of these invite codes:
      <br />
      <br />
      ${codesString}
      <br />
      <br />
      <a href="${appStoreUrl}" target="_blank"/>Appstore download link</a> (iOS only)
      <br />
      <br />
      Relevant is a social news reader that promotes reliable information and rewards expertise.
      Instead of relying on quantity (# of likes, followers), Relevant’s algorithm relies on a quality metric - relevance score.
      This system is designed to penalise clickbait and fake news while promoting useful and reliable information.
      <br />
      `
    };
    status = await mail.send(data);
  } catch (err) {
    console.log('error sending out invite email ', err);
  }
  return status;
}

InviteSchema.statics.generateCodes = async function (user) {
  let invites = [];
  try {
    let codes = voucherCodes.generate({
      length: 5,
      count: 3,
      charset: voucherCodes.charset('alphabetic')
    });
    let savedCodes = codes.map(async code => {
      let invite = new this({ invitedBy: user._id, code });
      return await invite.save();
    });
    savedCodes = await Promise.all(savedCodes);
    console.log(savedCodes);
    await sendInviteCodes(user, codes);
  } catch (err) {
    console.log('error generating invites ', err);
  }
  return invites;
};

module.exports = mongoose.model('Invite', InviteSchema);

