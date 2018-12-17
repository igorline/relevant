import mongoose from 'mongoose';
import { EventEmitter } from 'events';

const { Schema } = mongoose;
const EarningsSchemaEvents = new EventEmitter();

const EarningsSchema = new Schema(
  {
    user: { type: String, ref: 'User' },
    source: { type: String, default: 'post' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    amount: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    type: String
  },
  {
    timestamps: true
  }
);

EarningsSchema.index({ from: 1 });
EarningsSchema.index({ user: 1 });
EarningsSchema.index({ user: 1, from: 1 });

EarningsSchema.statics.events = EarningsSchemaEvents;

EarningsSchema.statics.updateRewardsRecord = async function updateRewardsRecord(earning) {
  try {
    const defaults = {
      type: 'coins',
      source: 'post'
    };
    // earning.amount = earning.earned - earning.spent;
    earning = { ...defaults, ...earning };
    return await this.findOneAndUpdate(
      { user: earning.user, post: earning.post },
      { ...earning },
      { new: true, upsert: true }
    );
  } catch (err) {
    throw err;
  }
};

EarningsSchema.statics.updateUserBalance = async function updateBalance(earning) {
  try {
    earning = new this(earning);
    earning = await earning.save();
    return earning;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('Earnings', EarningsSchema);
