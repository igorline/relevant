import CommunityMember from '../api/community/community.member.model';
// import User from '../api/user/user.model';
// import RelevanceStats from '../api/relevanceStats/relevanceStats.model';
// import Stats from '../api/statistics/statistics.model';
// import Relevance from '../api/relevance/relevance.model';
// import Post from '../api/post/post.model';
// import CommunityFeed from '../api/communityFeed/communityFeed.model';
// import Treasury from '../api/treasury/treasury.model';
import PostData from '../api/post/postData.model';
import Community from '../api/community/community.model';
// import Invest from '../api/invest/invest.model';

// TODO update post embedded user to _id
// user check handle?
const DEFAULT_COMMINITY = 'relevant';
let DEFAULT_COMMINITY_ID;

const queue = require('queue');

const q = queue({
  concurrency: 20
});

/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

async function populateCommunityEmbeddedUsuer() {
  let members = await CommunityMember.find({ 'embeddedUser.handle': { $exists: false } })
  .populate('user', 'name handle image');
  members = members.map(m => {
    m.embeddedUser = m.user.toObject();
    return m.save();
  });
  return Promise.all(members);
}

async function updateMemberCount() {
  let communities = await Community.find({});
  communities = communities.map(c => c.updateMemeberCount());
  return Promise.all(communities);
}

// check empty post data
async function cleanupPostData() {
  let postData = await PostData.find({}).populate('post');
  postData = postData
  .filter(d => !d.post)
  .map(d => {
    console.log(d.toObject());
    return d.remove();
  });
  return Promise.all(postData);
}


async function runUpdates() {
  try {
    const dc = await Community.findOne({ slug: DEFAULT_COMMINITY });
    DEFAULT_COMMINITY_ID = dc._id;

    // await populateCommunityEmbeddedUsuer();
    // console.log(await updateMemberCount());

    // TODO clean up PostData left over from tests
    await cleanupPostData();

    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

// runUpdates();
