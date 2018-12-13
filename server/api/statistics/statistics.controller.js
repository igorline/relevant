import Stats from './statistics.model';
import RelevanceStats from '../relevanceStats/relevanceStats.model';

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

async function getDailyRelevance() {
  try {
    const stats = await Stats.find({});
    stats.forEach(async stat => {
      let relevance = 0;
      const hours = stat.hours.toObject();
      const l = Object.keys(hours).length;
      Object.keys(hours).forEach(h => {
        if (hours[h] && typeof hours[h] === 'number') {
          relevance += hours[h];
        }
      });
      stat.totalSamples = l;
      // stat.relevance = relevance;
      if (!stat.aggregateRelevance) stat.aggregateRelevance = relevance;
      stat.aggregateRelevance = relevance;
      stat.date = new Date(stat.startTime).setUTCHours(0, 0, 0, 0);
      await stat.save();
      console.log(stat);
    });
  } catch (err) {
    console.log('stat error');
    console.log(err);
  }
}
// getDailyRelevance();

exports.index = (req, res) => {
  let time = req.query.time;
  time = new Date(time);
  const now = new Date();
  const hour = time.getHours();
  const hour2 = now.getHours();

  Stats.find()
    .exec((err, stats) => {
      res.json(200, { stats, time, now, hour, hour2 });
    });
};

exports.user = async (req, res, next) => {
  try {
    let stats;
    const { communityId } = req.communityMember;
    const user = req.user._id;
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    stats = await Stats.find({ user, date: { $gte: start, $lt: end }, communityId }, 'aggregateRelevance totalSamples date communityId');
    console.log('sats ', stats);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

exports.change = (req, res) => {
  let id = req.params.id;
  if (!id) id = req.user._id;
  if (!id) return handleError(res, 'No user id');
  const startTime = (new Date(req.query.startTime)).setHours(0, 0, 0, 0);
  const endTime = (new Date(req.query.endTime)).setHours(0, 0, 0, 0);
  const query = { user: id, startTime: { $gte: startTime, $lte: endTime } };

  Stats.find(query)
    .exec((err, stats) => {
      if (err || !stats.length) return handleError(res, err);
      const startDate = new Date(req.query.startTime);
      const startHour = startDate.getHours();
      const endHour = (new Date(req.query.endTime)).getHours();
      const startObject = stats.find(s =>
      // console.log(s.startTime == new Date(startTime))
      // console.log('STAT START ', s.startTime.getTime());
      // console.log(startTime);
        (s.startTime.getTime() == startTime)
      );
      console.log('START TIME OBJECT ', startObject);
      let startAmount;
      if (!startObject) startAmount = 0;
      else startAmount = startObject.hours[startHour] || 0;
      const endAmount = stats[stats.length - 1].hours[endHour] || 0;
      let change;
      if (startAmount) change = (endAmount - startAmount) * 100 / startAmount;
      else change = 0;
      const response = {
        change,
        startAmount,
        endAmount
      };
      res.json(200, response);
    });
};
