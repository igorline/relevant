import { keys } from './keys';

export const user1 = {
  _id: 'a00000000000000000000000',
  image: 'alice-pic.jpg',
  handle: 'alice',
  bio: "hi i'm alice!",
  name: 'Alice',
  email: 'alice@alice.com',
  relevance: { pagerank: 11 },
  balance: 111,
  lockedTokens: 0,
  password: 'test',
  ethAddress: [keys[0].address]
};

export const user2 = {
  _id: 'b00000000000000000000000',
  image: 'bob-pic.jpg',
  handle: 'bob',
  bio: 'sup bro!',
  name: 'Bob',
  email: 'bob@bob.com',
  relevance: { pagerank: 22 },
  balance: 222,
  lockedTokens: 0,
  password: 'test',
  ethAddress: [keys[1].address]
};

export const user3 = {
  _id: 'c00000000000000000000000',
  image: 'carol-pic.jpg',
  bio: 'admin of a few communities',
  handle: 'carol',
  name: 'Carol',
  email: 'carol@carol.com',
  relevance: { pagerank: 33 },
  balance: 333,
  lockedTokens: 0,
  password: 'test',
  ethAddress: [keys[2].address]
};

export const allUsers = [user1, user2, user3];

export const usersState = {
  users: { [user1._id]: user1, [user2._id]: user2, [user3._id]: user3 },
  handleToId: {
    [user1.handle]: user1._id,
    [user2.handle]: user2._id,
    [user3.handle]: user3._id
  }
};
