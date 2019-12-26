import Post from 'server/api/post/post.model'; // eslint-disable-line
import PostData from 'server/api/post/postData.model'; // eslint-disable-line
import CommunityMember from 'server/api/community/community.member.model'; // eslint-disable-line
import Earnings from 'server/api/earnings/earnings.model'; // eslint-disable-line
import CommunityFeed from 'server/api/communityFeed/communityFeed.model'; // eslint-disable-line
import Treasury from 'server/api/treasury/treasury.model'; // eslint-disable-line
import Link from 'server/api/post/link.model'; // eslint-disable-line

import Invest from 'server/api/invest/invest.model';
import Community from 'server/api/community/community.model';
import User from 'server/api/user/user.model';

import {
  post1,
  linkPost1,
  linkPost2,
  linkPost3,
  linkPost4,
  linkPost5
} from 'app/mockdata/post';
import { allUsers } from 'app/mockdata/user';
import { allCommunities } from 'app/mockdata/community';

let userInstances = {};
let communityInstances = {};
let postInstances = {};

export function getUsers() {
  return userInstances;
}
export function getPosts() {
  return postInstances;
}
export function getCommunities() {
  return communityInstances;
}

export async function setupTestData() {
  await setupCommunities();
  await setupUsers();
  await setupMembers();
  await setupPosts();
  await setupVotes();
}

async function setupPosts() {
  let link1 = new Post(linkPost1);
  await link1.save();
  link1 = await link1.addPostData();

  // cross-post link1 to crypto community
  await link1.addPostData({ ...linkPost1, ...linkPost1.altCommunity });
  link1.insertIntoFeed(linkPost1.communityId);

  let link2 = new Post(linkPost2);
  await link2.save();
  link2 = await link2.addPostData();

  let link3 = new Post(linkPost3);
  await link3.save();
  link3 = await link3.addPostData();

  let link4 = new Post(linkPost4);
  await link4.save();
  link4 = await link4.addPostData();

  let link5 = new Post(linkPost5);
  await link5.save();
  link5 = await link5.addPostData();

  delete post1.link;
  let postI1 = new Post(post1);
  await postI1.save();
  postI1 = await postI1.addPostData();

  const addToFeed = [link1, link2, link3, link4, link5].map(async p => {
    await p.upsertMetaPost(undefined, p.toObject());
    return p.insertIntoFeed(p.communityId);
  });

  await Promise.all(addToFeed);

  postInstances = { postI1, link1, link2, link3, link4, link5 };
}

async function setupUsers() {
  let users = allUsers.map(async _user => {
    delete _user.relevance;
    const user = new User(_user);
    return user.save();
  });
  users = await Promise.all(users);
  const alice = users.find(u => u.handle === 'alice');
  const bob = users.find(u => u.handle === 'bob');
  const carol = users.find(u => u.handle === 'carol');
  return (userInstances = { alice, bob, carol });
}

async function setupCommunities() {
  let communities = allCommunities.map(async _community => {
    const community = new Community(_community);
    return community.save();
  });
  communities = await Promise.all(communities);
  const relevant = communities.find(c => c.slug === 'relevant');
  const crypto = communities.find(c => c.slug === 'crypto');
  return (communityInstances = { relevant, crypto });
}

async function setupMembers() {
  const { relevant, crypto } = communityInstances;
  const { alice, bob, carol } = userInstances;

  await relevant.join(alice._id, 'admin');
  await relevant.join(bob._id);
  await relevant.join(carol._id);

  await crypto.join(alice._id, 'admin');
  await crypto.join(bob._id);
}

export async function setupVotes() {
  const { relevant, crypto } = communityInstances;
  const { alice, bob, carol } = userInstances;
  const votes = [];
  votes[0] = new Invest({
    investor: alice._id,
    author: bob._id,
    amount: 1,
    ownPost: false,
    communityId: relevant._id,
    community: relevant.slug
  });

  votes[1] = new Invest({
    investor: alice._id,
    author: bob._id,
    amount: 1,
    ownPost: false,
    communityId: crypto._id,
    community: crypto.slug
  });

  votes[2] = new Invest({
    investor: alice._id,
    author: carol._id,
    amount: 1,
    ownPost: false,
    communityId: relevant._id,
    community: relevant.slug
  });

  votes[3] = new Invest({
    investor: alice._id,
    author: bob._id,
    amount: 1,
    ownPost: false,
    communityId: crypto._id,
    community: crypto.slug
  });

  return Promise.all(votes.map(v => v.save()));
}
