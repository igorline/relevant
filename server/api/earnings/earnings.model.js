import mongoose from 'mongoose';
import { EventEmitter } from 'events';

const Schema = mongoose.Schema;
const EarningsSchemaEvents = new EventEmitter();

let EarningsSchema = new Schema({
  user: { type: String, ref: 'User' },
  from: [{ type: String, ref: 'User' }],
  source: { type: String, default: 'post' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  amount: { type: Number, default: 0 },
}, {
  timestamps: true
});

EarningsSchema.index({ from: 1 });
EarningsSchema.index({ user: 1 });
EarningsSchema.index({ user: 1, from: 1 });

EarningsSchema.statics.events = EarningsSchemaEvents;

EarningsSchema.statics.updateUserBalance = async function updateBalance(earning) {
  try {
    console.log('earning record: ',
      earning.amount,
      ' to ', earning.user,
      'from ', earning.investor || earning.source
    );
    earning = new this(earning);

    earning = await earning.save();
  } catch (err) {
    console.log('error updating earnings ', err);
  }
  return earning;
};

module.exports = mongoose.model('Earnings', EarningsSchema);
