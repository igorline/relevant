import { user2, user3 } from 'app/mockdata/user';

const IMAGES = [
  'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/cute-cat-captions-1563551865.jpg',
  'https://i.pinimg.com/originals/5e/b4/49/5eb449b181999dabed59a857503031ad.jpg',
  'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
  'https://i.pinimg.com/564x/e6/44/ea/e644eacfa75ecb5cb73e220bb0c7ef01.jpg'
];

export const post1 = {
  _id: '000000000000000000000001',
  user: 'b00000000000000000000000',
  title: 'postTitle',
  embeddedUser: user2,
  tags: ['tag11', 'tag12'],
  body: 'awesome post #1!',
  postDate: new Date('January 31, 2019 04:01:01 EST'),
  payoutTime: new Date('February 3, 2019 04:01:01 EST'),
  data: { pagerank: 45, relevance: 45, payout: 18 * 10 ** 18 },
  url: 'https://example.com/testPost1',
  image: IMAGES[0],
  link: {
    image: IMAGES[0],
    url: 'https://example.com/testPost1',
    domain: 'link.domain1',
    title: 'postTitle1'
  },
  parentPost: '000000000000000000000003',
  type: 'post',
  community: 'relevant',
  communityId: 'c00000000000000000000001',
  domain: 'link.domain1'
};

export const post2 = {
  _id: '000000000000000000000002',
  user: 'c00000000000000000000000',
  title: 'postTitle2',
  embeddedUser: user3,
  tags: ['tag21', 'tag22'],
  body: 'awesome post #2!',
  postDate: new Date('January 31, 2019 04:02:02 EST'),
  payoutTime: new Date('February 3, 2019 04:02:02 EST'),
  data: { pagerank: 45, payout: 18 * 10 ** 18 },
  url: 'https://example.com/testPost2',
  image: IMAGES[1],
  link: {
    image: IMAGES[1],
    url: 'https://example.com/testPost2',
    domain: 'link.domain2',
    title: 'postTitle2'
  },
  parentPost: '000000000000000000000003',
  parentComment: '000000000000000000000001',
  type: 'comment',
  community: 'relevant',
  communityId: 'c00000000000000000000001',
  domain: 'link.domain2'
};

export const linkPost1 = {
  _id: '000000000000000000000003',
  title: 'An Awesome Link #1 posted in both relevant and crypto',
  tags: ['tag31', 'tag32'],
  postDate: new Date(),
  payoutTime: new Date(),
  url: 'https://example.com/linkPost1',
  image: IMAGES[0],
  type: 'link',
  community: 'relevant',
  communityId: 'c00000000000000000000001',
  altCommunity: {
    community: 'crypto',
    communityId: 'c00000000000000000000002'
  },
  hidden: false,
  domain: 'link.domain3'
};

export const linkPost2 = {
  _id: '000000000000000000000004',
  title: 'An Awesome Link #2',
  tags: ['tag31', 'tag32'],
  postDate: new Date(),
  payoutTime: new Date(),
  url: 'https://example.com/linkPost2',
  image: IMAGES[1],
  type: 'link',
  community: 'relevant',
  communityId: 'c00000000000000000000001',

  hidden: false,
  domain: 'link.domain4'
};

export const linkPost3 = {
  _id: '000000000000000000000005',
  title: 'An Awesome Link #3 posted in crypto',
  tags: ['tag51', 'tag52'],
  postDate: new Date(),
  payoutTime: new Date(),
  url: 'https://example.com/linkPost3',
  image: IMAGES[2],
  type: 'link',
  community: 'crypto',
  communityId: 'c00000000000000000000002',
  hidden: false,
  domain: 'link.domain5'
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export const linkPost4 = {
  _id: '000000000000000000000006',
  title: 'An Awesome Link #4 - Pending payout',
  tags: ['tag51', 'tag52'],
  postDate: new Date(),
  payoutTime: tomorrow,
  url: 'https://example.com/linkPost4',
  image: IMAGES[3],
  type: 'link',
  community: 'crypto',
  communityId: 'c00000000000000000000002',
  hidden: false,
  domain: 'link.domain5'
};

export const linkPost5 = {
  _id: '000000000000000000000007',
  title: 'An Awesome Link #6',
  tags: ['tag51', 'tag52'],
  postDate: new Date(),
  payoutTime: new Date(),
  url: 'https://example.com/linkPost5',
  image: IMAGES[0],
  type: 'link',
  community: 'crypto',
  communityId: 'c00000000000000000000002',
  hidden: false,
  domain: 'link.domain6'
};

export const createPost = {
  url: 'https://example.com/testPost1',
  image: IMAGES[0],
  tags: ['tag11', 'tag12'],
  body: 'awesome post #1!',
  title: 'postTitle',
  description: 'my amazing post',
  mentions: ['test', 'user1'],
  domain: 'example.com'
};

export const postsState = {
  posts: {
    [post1._id]: post1,
    [post2._id]: post2,
    [linkPost1._id]: linkPost1,
    [linkPost2._id]: linkPost2
  }
};
