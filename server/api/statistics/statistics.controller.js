import Stats from './statistics.model';

exports.index = (req, res) => {
  let { time } = req.query;
  time = new Date(time);
  const now = new Date();
  const hour = time.getHours();
  const hour2 = now.getHours();

  Stats.find().exec((err, stats) => {
    res.json(200, { stats, time, now, hour, hour2 });
  });
};

exports.user = async (req, res, next) => {
  try {
    const { communityId } = req.communityMember;
    const user = req.user._id;
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    const stats = await Stats.find(
      { user, date: { $gte: start, $lt: end }, communityId },
      'aggregateRelevance totalSamples date communityId'
    );
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

exports.change = (req, res, next) => {
  let { id } = req.params;
  if (!id) id = req.user._id;
  if (!id) return next(new Error('No user id'));
  const startTime = new Date(req.query.startTime).setHours(0, 0, 0, 0);
  const endTime = new Date(req.query.endTime).setHours(0, 0, 0, 0);
  const query = { user: id, startTime: { $gte: startTime, $lte: endTime } };

  return Stats.find(query).exec((err, stats) => {
    if (err || !stats.length) return next(err);
    const startDate = new Date(req.query.startTime);
    const startHour = startDate.getHours();
    const endHour = new Date(req.query.endTime).getHours();
    const startObject = stats.find(
      s =>
        // console.log(s.startTime == new Date(startTime))
        // console.log('STAT START ', s.startTime.getTime());
        // console.log(startTime);
        s.startTime.getTime() === startTime
    );
    let startAmount;
    if (!startObject) startAmount = 0;
    else startAmount = startObject.hours[startHour] || 0;
    const endAmount = stats[stats.length - 1].hours[endHour] || 0;
    let change;
    if (startAmount) change = ((endAmount - startAmount) * 100) / startAmount;
    else change = 0;
    const response = {
      change,
      startAmount,
      endAmount
    };
    return res.json(200, response);
  });
};
