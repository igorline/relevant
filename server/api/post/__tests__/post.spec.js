/**
 * @jest-environment jsdom
 */
import mockingoose from 'mockingoose';

import User from 'server/api/user/user.model';
// import Post from 'server/api/post/post.model';
// import PostData from 'server/api/post/postData.model';
// import MetaPost from 'server/api/post/link.model';
import { user } from 'app/mockdata';

const { user1 } = user;

describe('test mongoose User model', () => {
  it('should return the doc with findById', async () => {
    mockingoose.User.toReturn(user1, 'findOne'); // findById is findOne

    const result = await User.findById({ _id: user1._id });
    expect(JSON.parse(JSON.stringify(result))).toMatchObject(user1);
  });

  it('should return the doc with update', async () => {
    mockingoose.User.toReturn(user1, 'update');

    const res = await User.update({ name: 'changed' }) // this won't really change anything
    .where({ _id: user1._id });

    expect(JSON.parse(JSON.stringify(res))).toMatchObject(user1);
  });
});
