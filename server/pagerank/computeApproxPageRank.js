import Invest from 'server/api/invest/invest.model';
import CommunityMember from 'server/api/community/community.member.model';
import Community from 'server/api/community/community.model';

export default async function computeApproxPageRank({
  author,
  post,
  user,
  communityId,
  vote,
  undoInvest
}) {
  try {
    const com = await Community.findOne(
      { _id: communityId },
      'maxUserRank maxPostRank numberOfElements'
    );
    const member = await CommunityMember.findOne({ communityId, user: user._id });

    let amount;
    if (vote) amount = vote.amount;
    const N = com.numberOfElements;
    const { maxUserRank, maxPostRank } = com;

    // if user relevance object doesn't exist, there is nothing to update
    if (!user.relevance || user.relevance.pagerankRaw <= 0) return { author, post };

    const userR = user.relevance ? user.relevance.pagerankRaw : 0;
    const authorId = author ? author._id : null;

    if (author && !author.relevance) {
      author.relevance = await CommunityMember.findOne({
        user: author._id,
        communityId
      });
    }

    // Need a way to 0 out post votes and user votes
    let postVotes = true;
    let userVotes = true;
    if (undoInvest) {
      postVotes = await Invest.countDocuments({ post: post._id, ownPost: false });
      if (!postVotes && post) {
        post.data.pagerank = 0;
        post.data.pagerankRaw = 0;
        post.data.pagerankRawNeg = 0;
        await post.data.save();
      }
      userVotes = await Invest.countDocuments({ author: authorId, ownPost: false });
      if (!userVotes && author) {
        author.relevance.pagerank = 0;
        author.relevance.pagerankRaw = 0;
        await author.relevance.save();
      }
      if (!postVotes && !userVotes) {
        return { author, post };
      }
    }

    const negPosRatio = member.pagerankRaw
      ? member.pagerankRawNeg / member.pagerankRaw
      : 0;

    const userDegree = member.degree * (1 + negPosRatio) + 1;
    const mergedDegree = member.degree + member.postDegree;
    const postDegree = mergedDegree * (1 + negPosRatio) + 1;

    const a = Math.abs(amount);
    const uInc = (a / userDegree) * userR;
    const pInc = (a / postDegree) * userR;
    const uDownvoteInc = uInc / 3;

    if (amount >= 0) {
      if (undoInvest) {
        if (author && userVotes) author.relevance.pagerankRaw -= uInc;
        if (post && postVotes) post.data.pagerankRaw -= pInc;
      } else {
        if (author) author.relevance.pagerankRaw += uInc;
        if (post) post.data.pagerankRaw += pInc;
      }
    } else if (amount < 0) {
      if (undoInvest) {
        if (author && userVotes) {
          author.relevance.pagerankRaw += uDownvoteInc;
        }
        if (post && postVotes) post.data.pagerankRawNeg -= pInc;
      } else {
        if (author) author.relevance.pagerankRaw -= uDownvoteInc;
        if (post) post.data.pagerankRawNeg += pInc;
      }
    }

    if (author) {
      const rA = author ? Math.max(author.relevance.pagerankRaw, 0) : 0;
      author.relevance.pagerank = Math.min(
        99,
        (100 * Math.log(N * rA + 1)) / Math.log(N * maxUserRank + 1)
      );
    }

    if (post) {
      const pRank = Math.max(post.data.pagerankRaw, 0);
      const pRankNeg = Math.max(post.data.pagerankRawNeg || 0, 0);

      const normRank = Math.min(
        100,
        (100 * Math.log(N * pRank + 1)) / Math.log(N * maxPostRank + 1)
      );
      const normRankNeg = Math.min(
        100,
        (100 * Math.log(N * pRankNeg + 1)) / Math.log(N * maxPostRank + 1)
      );

      post.data.pagerank = normRank - normRankNeg;
      await post.updateRank({ communityId });
    }

    await Promise.all([
      post ? post.data.save() : null,
      author ? author.relevance.save() : null
    ]);

    return { author, post };
  } catch (err) {
    console.log('page rank approx error ', err); // eslint-disable-line
    return null;
  }
}
