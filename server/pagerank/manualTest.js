require('@babel/register');
require('@babel/polyfill');
require('dotenv').config({ silent: true });

process.env.NODE_ENV = 'test';
process.env.WEB = 'true';

const computePageRank = require('./pagerankCompute').default;
const Community = require('../api/community/community.model').default;

const community = 'relevant';

const { db } = require('../config/db.connect');

async function runTest() {
  try {
    await db;
    const communityId = (await Community.findOne({ slug: community }))._id;
    await computePageRank({ communityId, community, debug: true });
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}

setTimeout(runTest, 3000);
// runTest();
