import TwitterFeed from 'server/api/twitterFeed/twitterFeed.model'; // eslint-disable-line
import Post from 'server/api/post/post.model';
import PostData from 'server/api/post/postData.model';
import Link from 'server/api/post/link.model';
import { response } from 'jest-mock-express';
import { create, remove } from 'server/api/post/post.controller';
import { post, community } from 'app/mockdata';
import { sanitize } from 'server/test/utils';
import { getUsers } from 'server/test/seedData';

let alice;
const { createPost } = post;
const { relevant } = community;

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'create-post';

describe('CreatePost', () => {
  let linkPostId;
  let linkParentId;
  let res;
  let req;
  const next = console.log; // eslint-disable-line

  beforeAll(async () => {
    await PostData.ensureIndexes();
    await Post.ensureIndexes();
  });

  beforeEach(() => {
    res = response();
    ({ alice } = getUsers());
    req = {
      user: alice,
      body: createPost,
      communityMember: {
        community: relevant.slug,
        communityId: relevant._id
      }
    };
  });

  describe('api/post/create', () => {
    test('create link post', async () => {
      await create(req, res, next);
      let apiRes = res.json.mock.calls[0][0].toObject();
      expect(apiRes.parentPost).toBeTruthy();
      expect(apiRes.parentPost.data.isInFeed).toBe(true);
      expect(apiRes.data.isInFeed).toBe(false);
      expect(apiRes.image).toBe(createPost.image);
      linkPostId = apiRes._id;
      linkParentId = apiRes.parentPost._id;
      apiRes = sanitize(apiRes, 'post');
      expect(apiRes).toMatchSnapshot();
    });

    test('create text post', async () => {
      const newReq = { ...req };
      delete newReq.body.url;
      await create(newReq, res, next);
      let apiRes = res.json.mock.calls[0][0].toObject();
      expect(apiRes.parentPost).not.toBeDefined();
      expect(apiRes.data.isInFeed).toBe(true);
      apiRes = sanitize(apiRes, 'post');
      expect(apiRes).toMatchSnapshot();
    });
  });

  describe('api/post/delete', () => {
    test('delete link post', async () => {
      const delReq = {
        user: alice,
        params: { id: linkPostId }
      };
      await remove(delReq, res, next);
      const apiRes = res.json.mock.calls[0][0];
      expect(apiRes).toEqual('removed');
    });
  });

  describe('After remove', () => {
    test('should remove parent', async () => {
      const doc = await Post.findOne({ _id: linkParentId });
      expect(doc).toBeNull();
    });
    test('should remove parent data', async () => {
      const doc = await PostData.findOne({ post: linkParentId });
      expect(doc).toBeNull();
    });
    test('should remove data', async () => {
      const doc = await PostData.findOne({ post: linkPostId });
      expect(doc).toBeNull();
    });
    test('should remove metaPost', async () => {
      const doc = await Link.findOne({ post: linkPostId });
      expect(doc).toBeNull();
    });
  });
});
