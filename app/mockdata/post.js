import { user1 } from 'app/mockdata/user';

export const post1 = {
  _id: 1111,
  user: 111,
  title: 'postTitle',
  embeddedUser: user1,
  tags: ['tag11', 'tag12'],
  body: 'awesome post #1!',
  postDate: new Date(),
  data: { pagerank: 45, payout: 18 * (10 ** 18) },
  link: { image: 'link_img1.jpg', url: 'https://example.com/testPost1', domain: 'link.domain1', title: 'postTitle1' },
  type: 'post',
};

export const post2 = {
  _id: 2222,
  user: 2222,
  title: 'postTitle2',
  embeddedUser: user1,
  tags: ['tag21', 'tag22'],
  body: 'awesome post #2!',
  postDate: new Date(),
  data: { pagerank: 45, payout: 18 * (10 ** 18) },
  link: { image: 'link_img2.jpg', url: 'https://example.com/testPost2', domain: 'link.domain2', title: 'postTitle2' },
  parentPost: 1111,
  type: 'comment',
};


export const postsState = {
  posts: { 234: post1 }
};
