import { test, request } from './../config/ava.config';
import computePageRank from './pagerankCompute';
import Community from '../api/community/community.model';

const community = 'relevant';

test.before(async () => {
  const { app } = require('../server.js');
  request(app);

  const communityId = (await Community.findOne({ slug: community }))._id;
  try {
    await computePageRank({ communityId, community, debug: true });
  } catch (err) {
    throw err;
  }
});

test.serial('Payout Create Post', async t => {
  t.plan(0);
});
