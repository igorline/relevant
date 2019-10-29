import { keys } from './keys';

const IMAGES = {
  alice:
    'https://hips.hearstapps.com/elleuk.cdnds.net/15/37/2048x2730/2048x2730-e6-8278-458c32fb7c74-assets-elleuk-com-gallery-17063-taylor-swift-hairstyle-bob-getty-gallery-01-jpg.jpg',
  bob:
    'https://yt3.ggpht.com/a/AGF-l7_IPKJORqk1Wo7AR4jMhW15Ma-za_QDlRxMcQ=s900-c-k-c0xffffffff-no-rj-mo',
  carol:
    'https://ichef.bbci.co.uk/news/640/cpsprodpb/A369/production/_87133814_87135704.jpg'
};

export const user1 = {
  _id: 'a00000000000000000000000',
  image: IMAGES.alice,
  handle: 'alice',
  bio: "hi i'm alice!",
  name: 'Alice',
  email: 'alice@alice.com',
  relevance: { pagerank: 11 },
  balance: 111,
  airdropTokens: 111,
  lockedTokens: 0,
  password: 'test',
  ethAddress: [keys[0].address],
  notificationSettings: { bet: { manual: true } },
  role: 'admin'
};

export const user2 = {
  _id: 'b00000000000000000000000',
  image: IMAGES.bob,
  handle: 'bob',
  bio: 'I love painting',
  name: 'Bob',
  email: 'bob@bob.com',
  relevance: { pagerank: 22 },
  balance: 222,
  airdropTokens: 222,
  lockedTokens: 0,
  password: 'test',
  ethAddress: [keys[1].address],
  notificationSettings: { bet: { manual: true } }
};

export const user3 = {
  _id: 'c00000000000000000000000',
  image: IMAGES.carol,
  bio: 'admin of a few communities',
  handle: 'carol',
  name: 'Carol',
  email: 'carol@carol.com',
  relevance: { pagerank: 33 },
  balance: 333,
  airdropTokens: 333,
  lockedTokens: 0,
  password: 'test',
  ethAddress: [keys[2].address],
  notificationSettings: { bet: { manual: true } }
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
