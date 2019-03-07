import { user2 } from 'app/mockdata/user';
import { post2 } from 'app/mockdata/post';

export const activity = {
  totlaUsers: 3,
  amount: 10,
  byUser: user2, // TODO create user prop type validation
  post: post2, // TODO create post prop type validation
  type: 'upvote',
  createdAt: new Date()
};
