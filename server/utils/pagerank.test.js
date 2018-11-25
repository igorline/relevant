import test from 'ava';
import computePageRank from './pagerankCompute';
import Community from '../api/community/community.model';

let request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.WEB = 'true';

process.chdir(__dirname + '/../../');

let r;
let community = 'relevant';

test.before(async () => {
  let app = require('../server.js').app;
  r = request(app);

  require('dotenv').config({ silent: true });
  let communityId = (await Community.findOne({ slug: community }))._id;
  try {
    await computePageRank({ communityId, community, debug: true });
  } catch (err) {
    console.log(err);
  }
});

test.serial('Payout Create Post', async (t) => {
  t.plan(0);
});
