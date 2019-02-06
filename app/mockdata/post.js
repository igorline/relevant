import { user1 } from 'app/mockdata/user';

export const post1 = {
  _id: '1',
  user: '1',
  title: 'postTitle',
  embeddedUser: user1,
  tags: ['tag11', 'tag12'],
  body: 'awesome post #1!',
  postDate: new Date('January 31, 2019 01:01:01'),
  data: { pagerank: 45, payout: 18 * 10 ** 18 },
  link: {
    image: 'link_img1.jpg',
    url: 'https://example.com/testPost1',
    domain: 'link.domain1',
    title: 'postTitle1'
  },
  type: 'post'
};

export const post2 = {
  _id: '2',
  user: '2',
  title: 'postTitle2',
  embeddedUser: user1,
  tags: ['tag21', 'tag22'],
  body: 'awesome post #2!',
  postDate: new Date('January 32, 2019 02:02:02'),
  data: { pagerank: 45, payout: 18 * 10 ** 18 },
  link: {
    image: 'link_img2.jpg',
    url: 'https://example.com/testPost2',
    domain: 'link.domain2',
    title: 'postTitle2'
  },
  parentPost: 1111,
  type: 'comment'
};

export const createPost = {
  url: 'https://example.com/testPost1',
  image: 'link_img1.jpg',
  tags: ['tag11', 'tag12'],
  body: 'awesome post #1!',
  title: 'postTitle',
  description: 'my amazing post',
  mentions: ['test', 'user1'],
  domain: 'example.com'
};

export const postsState = {
  posts: { 234: post1 }
};
