'use strict';

var Stats = require('./statistics.model');

exports.index = function(req, res) {
  var time = req.query.time;
  var time = new Date(time);
  var now = new Date();
  var hour = time.getHours();
  var hour2 = now.getHours();

  Stats.find()
      .exec((err, stats) => {
        res.json(200, {stats: stats, time: time, now: now, hour: hour, hour2: hour2});
      });
};

exports.chart = function(req, res) {
  var id = req.params.id;
  if (!id) id = req.user._id;
  if (!id) return handleError(res, 'No user id');
  var startTime = (new Date(req.query.startTime)).setHours(0, 0, 0, 0);
  var endTime = (new Date(req.query.endTime)).setHours(0, 0, 0, 0);
  var query = {user: id, startTime : {$gte : startTime, $lte : endTime}};
  console.log('Query: ', query);
  Stats.find(query)
      .exec((err, stats) => {
        console.log("STATS: ", stats);
        if (err) return handleError(res, err);
        res.json(200, stats);
      });
};

exports.change = function(req, res) {
  var id = req.params.id;
  if (!id) id = req.user._id;
  if (!id) return handleError(res, 'No user id');
  var startTime = (new Date(req.query.startTime)).setHours(0, 0, 0, 0);
  var endTime = (new Date(req.query.endTime)).setHours(0, 0, 0, 0);
  var query = {user: id, startTime : {$gte : startTime, $lte : endTime}};
  Stats.find(query)
      .exec((err, stats) => {
        if (err || !stats.length) return handleError(res, err);
        var startDate = new Date(req.query.startTime);
        var startHour = startDate.getHours();
        var endHour = (new Date(req.query.endTime)).getHours();
        var startObject = stats.find( s => {
          // console.log(s.startTime == new Date(startTime))
          // console.log('STAT START ', s.startTime.getTime());
          // console.log(startTime);
          return (s.startTime.getTime() == startTime)
        });
        console.log("START TIME OBJECT ", startObject);
        var startAmount;
        if (!startObject) startAmount = 0;
        else startAmount = startObject.hours[startHour] || 0;
        var endAmount = stats[stats.length - 1].hours[endHour] || 0;
        var change
        if (startAmount) change = (endAmount - startAmount) * 100 / startAmount;
        else change = 0;
        var response = {
          change: change,
          startAmount: startAmount,
          endAmount: endAmount
        }
        res.json(200, response);
      });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
};