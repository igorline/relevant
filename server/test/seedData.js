import Post from 'server/api/post/post.model'; // eslint-disable-line
import PostData from 'server/api/post/postData.model'; // eslint-disable-line
import CommunityMember from 'server/api/community/community.member.model'; // eslint-disable-line
import Earnings from 'server/api/earnings/earnings.model'; // eslint-disable-line
import CommunityFeed from 'server/api/communityFeed/communityFeed.model'; // eslint-disable-line

import Invest from 'server/api/invest/invest.model';
import Community from 'server/api/community/community.model';
import User from 'server/api/user/user.model';

import { linkPost1, linkPost2, linkPost3, linkPost4 } from 'app/mockdata/post';
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

  let link2 = new Post(linkPost2);
  await link2.save();
  link2 = await link2.addPostData();

  let link3 = new Post(linkPost3);
  await link3.save();
  link3 = await link3.addPostData();

  let link4 = new Post(linkPost4);
  await link4.save();
  link4 = await link4.addPostData();

  postInstances = { link1, link2, link3, link4 };
}

async function setupUsers() {
  let users = allUsers.map(async _user => {
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

  let vote = new Invest({
    investor: alice._id,
    author: bob._id,
    amount: 1,
    ownPost: false,
    communityId: relevant._id,
    community: relevant.slug
  });
  await vote.save();

  vote = new Invest({
    investor: alice._id,
    author: bob._id,
    amount: 1,
    ownPost: false,
    communityId: crypto._id,
    community: crypto.slug
  });

  vote = new Invest({
    investor: alice._id,
    author: carol._id,
    amount: 1,
    ownPost: false,
    communityId: relevant._id,
    community: relevant.slug
  });
  await vote.save();

  vote = new Invest({
    investor: alice._id,
    author: bob._id,
    amount: 1,
    ownPost: false,
    communityId: crypto._id,
    community: crypto.slug
  });
  await vote.save();
}
