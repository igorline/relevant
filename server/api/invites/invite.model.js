import mongoose from 'mongoose';
import voucherCodes from 'voucher-code-generator';
import mail from '../../mail';

const Schema = mongoose.Schema;

let InviteSchema = new Schema({
  email: { type: String },
  name: { type: String },
  code: { type: String, index: true },
  redeemed: { type: Boolean, default: false },
  status: { type: String },
  invitedBy: { type: String, ref: 'User' }
}, {
  timestamps: true
});


async function sendInviteCodes(user, codes) {
  let status;
  let codesString = '<b>' + codes.join('<br />') + '</b>';
  try {
    // let appStoreUrl = 'http://itunes.com/apps/relevant';
    // let appStoreUrl = 'https://beta.itunes.apple.com/v1/invite/4a6e102029cb485b9e443ad17a65de3fce01cad9aaa948adaf95840ed2a32c6945eaf11b?ct=slavabalasan299393905&advp=10000&platform=ios';
    // let url = `${process.env.API_SERVER}/invite/${invite.code}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: user.email,
      subject: 'Invitation Codes!',
      html: `If you know a thought leader who posesses valuable information, send them one of these invite codes:
      <br />
      <br />
      ${codesString}
      <br />`
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

