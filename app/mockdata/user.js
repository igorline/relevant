export const user1 = {
  _id: '111111111111111111111111',
  image: 'userImage1.jpg',
  handle: 'handle1',
  name: 'Name1',
  relevance: { pagerank: 11 },
  balance: 111
};

export const user2 = {
  _id: '222222222222222222222222',
  image: 'userImage2.jpg',
  handle: 'handle2',
  name: 'Name2',
  relevance: { pagerank: 22 },
  balance: 222
};

export const usersState = {
  users: { [user1._id]: user1, [user2._id]: user2 },
  handleToId: { [user1.handle]: user1._id, [user2.handle]: user2._id }
};
