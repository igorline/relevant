import Relevance from 'server/api/relevance/relevance.model';
import PostData from 'server/api/post/postData.model';
import Invest from 'server/api/invest/invest.model';

import { sanitize, toObject } from 'server/test/utils';
import { getUsers, getPosts, getCommunities } from 'server/test/seedData';
import computePageRank, { computeApproxPageRank } from 'server/utils/pagerankCompute';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'pagerankCompute-approx';

jest.mock('server/utils/ethereum');

describe('ethRewards', () => {
  let {
    alice,
    bob,
    carol,
    relevant,
    postI1,
    communityId,
    pagerank,
    link1,
    link2,
    link3
  } = {};

  const next = console.log; // eslint-disable-line

  beforeAll(async () => {
    ({ relevant } = getCommunities());
    ({ alice, bob, carol } = getUsers());
    ({ link1, link2, link3, postI1 } = getPosts());
    communityId = relevant._id;
    const votes = [];

    votes[0] = Invest({
      investor: alice._id,
      post: link1._id,
      amount: 1,
      ownPost: false,
      communityId: relevant._id,
      community: relevant.slug
    });

    votes[1] = Invest({
      investor: bob._id,
      post: link2._id,
      amount: 1,
      ownPost: false,
      communityId: relevant._id,
      community: relevant.slug
    });

    votes[2] = Invest({
      investor: carol._id,
      post: link3._id,
      amount: 1,
      ownPost: false,
      communityId: relevant._id,
      community: relevant.slug
    });

    votes[3] = Invest({
      investor: carol._id,
      author: bob._id,
      post: postI1._id,
      amount: 1,
      ownPost: false,
      communityId: relevant._id,
      community: relevant.slug
    });
    await Promise.all(votes.map(v => v.save()));
    // need to run this to give inital rank to admin
    await computePageRank({ community: relevant.slug, communityId, debug: false });
  });

  beforeEach(() => {
    // global.console = { log: jest.fn() }; // hides logs
  });

  describe('computeApproxPageRank', () => {
    test('should upvote and undo', async () => {
      await testCompute({ amount: 0.5, hasAuthor: true });
    });
  });

  describe('computeApproxPageRank', () => {
    test('should downvote and undo', async () => {
      await testCompute({ amount: -0.5, hasAuthor: true });
    });
  });

  describe('computeApproxPageRank', () => {
    test('should upvote and undo with no author', async () => {
      await testCompute({ amount: -1, hasAuthor: false });
    });
  });

  async function testCompute({ amount, hasAuthor }) {
    const relevantVote = {
      relevanceToAdd: 10,
      community: relevant.slug,
      communityId: relevant._id,
      amount
    };

    postI1.data = await PostData.findOne({ post: postI1._id, communityId });
    const startPagerank = postI1.data.pagerank;

    bob.relevance = await Relevance.findOne({ user: bob._id, communityId, global: true });
    const startAuthorRank = bob.relevance.pagerank;

    let vote = new Invest({
      ...relevantVote,
      investor: alice._id,
      author: hasAuthor ? bob._id : null,
      post: postI1._id,
      ownPost: false
    });
    vote = await vote.save();

    alice.relevance = await Relevance.findOne({
      user: alice._id,
      communityId,
      global: true
    });

    let result = await computeApproxPageRank({
      user: alice,
      author: hasAuthor ? bob : null,
      communityId,
      post: postI1,
      vote
    });

    const { author, post } = result;

    const authorSan = sanitize(toObject(author), 'hashedPassword lastVote salt');
    const postSan = sanitize(toObject(post));
    if (hasAuthor) {
      authorSan.relevance.pagerank = Math.round(authorSan.relevance.pagerank * 100) / 100;
      authorSan.relevance.pagerankRaw =
        Math.round(authorSan.relevance.pagerankRaw * 1000) / 1000;
    }

    postSan.data.pagerank = Math.round(postSan.data.pagerank * 100) / 100;
    postSan.data.pagerankRaw = Math.round(postSan.data.pagerankRaw * 1000) / 1000;
    postSan.data.pagerankRawNeg = Math.round(postSan.data.pagerankRawNeg * 1000) / 1000;

    expect({ post: postSan, author: authorSan }).toMatchSnapshot();

    await vote.remove();
    result = await computeApproxPageRank({
      user: alice,
      author,
      communityId,
      post,
      vote,
      undoInvest: true
    });

    pagerank = result.post.data.pagerank;
    expect(pagerank).toBeCloseTo(startPagerank, 2);
    if (hasAuthor) {
      expect(result.author.relevance.pagerank).toBeCloseTo(startAuthorRank, 2);
    }
  }
});
