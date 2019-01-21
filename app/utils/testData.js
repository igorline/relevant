
export const user1 = {
  _id: 111,
  image: 'userImage1.jpg',
  handle: 'handle1',
  name: 'Name1',
  relevance: { pagerank: 11 },
  balance: 111
};

export const user2 = {
  _id: 222,
  image: 'userImage2.jpg',
  handle: 'handle2',
  name: 'Name2',
  relevance: { pagerank: 22 },
  balance: 222
};


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
  title: 'postTitle',
  embeddedUser: user1,
  tags: ['tag21', 'tag22'],
  body: 'awesome post #2!',
  postDate: new Date(),
  data: { pagerank: 45, payout: 18 * (10 ** 18) },
  link: { image: 'link_img2.jpg', url: 'https://example.com/testPost2', domain: 'link.domain2', title: 'postTitle2' },
  parentPost: 1111,
  type: 'comment',
};


export const usersState = {
  users: { [user1._id]: user1, [user2._id]: user2 },
  handleToId: { [user1.handle]: user1._id, [user2.handle]: user2._id }
};

export const postsState = {
  posts: { 234: post1 }
};

export const activity = {
  totlaUsers: 3,
  amount: 10,
  byUser: user2, // TODO create user prop type validation
  post: post2, // TODO create post prop type validation
  type: 'upvote',
  createdAt: new Date()
};

export const auth = {
  community: 'testCommunity',
  user: user1,
  isAuthenticated: true
};

