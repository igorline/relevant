/**
 * @jest-environment node
 */
import request from 'supertest';
import computePageRank from './pagerankCompute';
import Community from '../api/community/community.model';

const community = 'crypto';

const { app, db } = require('../server.js');

beforeAll(async () => {
  await db;
  request(app);
});

describe('Pagerank', () => {
  test('Log Current Pagerank', async () => {
    const communityId = (await Community.findOne({ slug: community }))._id;
    await computePageRank({ communityId, community, debug: true });
  });
});
