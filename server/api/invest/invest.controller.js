import Invest from 'server/api/invest/invest.model';
import Post from 'server/api/post/post.model';
import Community from 'server/api/community/community.model';
import { create } from './createVote';

exports.create = create;

exports.bet = async (req, res, next) => {
  try {
    const { user } = req;
    const { stakedTokens, postId: _id } = req.body;
    if (stakedTokens === 0) throw new Error("You don't have enough tokens to bet");
    const { communityId, community } = req.communityMember;
    const communityObj = await Community.findOne({ _id: communityId });
    if (communityObj.betEnabled === false) {
      throw new Error("This community doesn't support betting");
    }
    const post = await Post.findOne({ _id }).populate({
      path: 'data',
      match: { communityId }
    });
    let vote = await Invest.findOne({ post: _id, investor: user._id });
    if (!vote) throw new Error('You must upvote the post first');
    vote = await vote.placeBet({ post, community, communityId, stakedTokens, user });
    return res.status(200).json(vote);
  } catch (err) {
    return next(err);
  }
};

exports.postInvestments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const { community } = req.query;

    const investments = await Invest.find({ post: postId, amount: { $gt: 0 } })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({
        path: 'investor',
        select: 'name image handle',
        populate: {
          path: 'relevance',
          match: { community }
        }
      });

    return res.status(200).json(investments);
  } catch (err) {
    return next(err);
  }
};

exports.postvotes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const { community } = req.query;

    const votes = await Invest.find({ post: postId, amount: { $gt: 0 } })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({
        path: 'investor',
        select: 'name image handle',
        populate: {
          path: 'relevance',
          match: { community }
        }
      });

    return res.status(200).json(votes);
  } catch (err) {
    return next(err);
  }
};

exports.downvotes = async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || null;
  const skip = parseInt(req.query.skip, 10) || null;
  let downvotes;
  try {
    downvotes = await Invest.find({ amount: { $lt: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('post');

    return res.status(200).json(downvotes);
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { communityId } = req.communityMember;
    const { user } = req;

    const blocked = user ? [...user.blocked, ...user.blockedBy] : [];

    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const userId = req.params.userId || null;
    const sortQuery = { createdAt: -1 };
    const query = { investor: userId, amount: { $gt: 0 } };

    if (blocked.find(u => u.toString() === userId.toString())) {
      return res.status(200).json({});
    }

    const votes = await Invest.find(query)
      .populate({
        path: 'post',
        populate: [
          {
            path: 'embeddedUser.relevance',
            match: { communityId }
          },
          {
            path: 'data',
            select: 'pagerank'
          },
          {
            path: 'metaPost'
          }
        ]
      })
      .limit(limit)
      .skip(skip)
      .sort(sortQuery);
    return res.status(200).json(votes);
  } catch (err) {
    return next(err);
  }
};
