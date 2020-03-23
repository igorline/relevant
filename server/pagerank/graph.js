import {
  RELEVANCE_DECAY,
  // REP_CUTOFF,
  RELEVANCE_DECAY_POSTS,
  REP_CUTOFF_POSTS
} from 'server/config/globalConstants';

const IS_TEST = process.env.NODE_ENV === 'test';
const DEFAULT_WEIGHT_FROM_ADMIN = 0.15;

export default class Graph {
  userNodes = {};

  postNodes = {};

  constructor({ votes, admins, community, usersWithDefault }) {
    this.community = community;
    this.admins = admins;
    usersWithDefault && usersWithDefault.forEach(user => this.initUserNode(user));
    admins.forEach(user => this.initUserNode(user));
    this.now = new Date();
    return this.run(votes);
  }

  run = votes => {
    votes.forEach(this.processVote);
    // this.cancelledVotes();
    // this.userNodes.danglingConsumer = {
    //   type: 'hypothetical',
    //   _id: 'danglingConsumer',
    //   inputs: { danglingConsumer: 1 },
    //   degree: 1,
    //   start: this.community.danglingConsumer
    // };

    this.processNegatives();
    this.addDefaultWeights();
    this.pruneNoInput();
    return { nodes: this.userNodes, postNodes: this.postNodes };
  };

  processVote = vote => {
    const user = vote.investor;
    if (!user) return null;

    const { author, amount } = vote;
    // don't process own votes
    if (author && user._id.equals(author._id)) return null;

    let { post } = vote;

    // filter out older posts
    if (!IS_TEST) {
      const timeLimitPost = new Date(this.now.getTime() - REP_CUTOFF_POSTS);
      if (new Date(vote.createdAt) < timeLimitPost) post = null;
    }

    const a = amount;
    if (!a) return null;

    // time discount (RELEVANCE_DECAY month half-life)
    const t = this.now.getTime() - vote.createdAt.getTime();
    const userWeight = Math.abs(a) * (1 / 2) ** (t / RELEVANCE_DECAY);
    const postWeight = Math.abs(a) * (1 / 2) ** (t / RELEVANCE_DECAY_POSTS);

    const downvote = a < 0;

    const userNode = this.initUserNode(user);
    author && this.handleAuthorNode({ author, user, downvote, userWeight, userNode });
    post && this.handlePostNode({ post, userNode, downvote, postWeight });

    return null;
  };

  addDefaultWeights = () => {
    const DWNode = {
      type: 'hypothetical',
      _id: 'defaultWeight',
      inputs: {},
      degree: 0,
      start: this.community.danglingConsumer
    };

    Object.values(this.userNodes).forEach(node => {
      if (node.defaultWeight) {
        DWNode.degree += node.defaultWeight || 0;
        node.inputs[DWNode._id] = node.defaultWeight;
      }
    });

    if (DWNode.degree === 0) return;

    this.admins.forEach(admin => {
      const a = this.userNodes[admin._id];
      const defaultWeight = a.degree ? a.degree * DEFAULT_WEIGHT_FROM_ADMIN : 1;
      a.degree += defaultWeight;
      DWNode.inputs[a._id] = defaultWeight;
    });

    this.userNodes.defaultWeight = DWNode;
  };

  processNegatives = () => {
    this.userNodes.negConsumer = {
      type: 'hypothetical',
      _id: 'negConsumer',
      inputs: {},
      degree: 0,
      start: this.community.negConsumer
    };
    Object.values(this.userNodes).forEach(node => {
      if (!node.prevNeg || !node.prevPos || !node.degree) return;
      // add to the degree if node has negative rank
      const posNegRatio = node.prevNeg / node.prevPos;
      const negDegree = node.degree * posNegRatio;

      node.degree += negDegree;
      this.userNodes.negConsumer.inputs = {
        ...this.userNodes.negConsumer.inputs,
        [node._id]: negDegree
      };
    });
  };

  pruneNoInput = () => {
    const adminIds = this.admins.map(a => a._id);
    Object.values(this.userNodes).forEach(node => {
      if (Object.keys(node.inputs).length === 0 && !adminIds.includes(node._id)) {
        delete this.userNodes[node._id];
      }
    });
  };

  // cancelledVotes = () => {
  //   Object.values(this.userNodes)
  //     .filter(node => node.negativeNode)
  //     .forEach(node => {
  //       const positiveNode = this.userNodes[node._id.toString().replace('__neg', '')];
  //       if (!positiveNode) return;
  //       const nInputs = Object.keys(node.inputs);
  //       const common = Object.keys(positiveNode.inputs).filter(k => nInputs.includes(k));
  //       if (common.length) {
  //         common.forEach(k => {
  //           // console.log('neg:', node.inputs[k], 'pos:', positiveNode.inputs[k]);
  //         });
  //       }
  //     });
  // };

  cancelOutOpposites = ({ author, userNode, userWeight, downvote }) => {
    const oId = !downvote ? author._id + '__neg' : author._id;
    const oNode = this.userNodes[oId] && this.userNodes[oId].inputs[userNode._id];

    if (!oNode) return userWeight;

    if (oNode > userWeight) {
      this.userNodes[oId].inputs[userNode._id] -= userWeight;
      userNode.degree -= userWeight;
      return null;
    }
    if (oNode < userWeight) {
      userWeight -= oNode;
      userNode.degree -= oNode;
      delete this.userNodes[oId].inputs[userNode._id];
      return userWeight;
    }
    if (oNode === userWeight) {
      delete this.userNodes[oId].inputs[userNode._id];
      userNode.degree -= oNode;
      return null;
    }
    return userWeight;
  };

  handleAuthorNode = ({ author, downvote, userWeight, userNode }) => {
    const _id = downvote ? author._id + '__neg' : author._id;

    // check if an opposite vote exists and adjust userWeight
    userWeight = this.cancelOutOpposites({ author, userNode, userWeight, downvote });
    if (!userWeight) return;

    const authorNode = this.initUserNode({ ...author.toObject(), _id }, downvote);

    authorNode.inputs[userNode._id] = authorNode.inputs[userNode._id]
      ? authorNode.inputs[userNode._id] + userWeight
      : userWeight;

    userNode.degree += userWeight;
  };

  handlePostNode = ({ post, userNode, downvote, postWeight }) => {
    const _id = downvote ? post._id + '__neg' : post._id;
    const postNode = this.initPostNode({ ...post.toObject(), _id }, downvote);
    postNode.inputs[userNode._id] = postNode.inputs[userNode._id]
      ? postNode.inputs[userNode._id] + postWeight
      : postWeight;

    // userNode.degree += postWeight;
    userNode.postDegree += postWeight;
  };

  initUserNode = (user, downvote) => {
    if (!user) return null;
    if (this.userNodes[user._id]) return this.userNodes[user._id];
    if (!user.relevance) console.log('error: user missing reputaion', user); // eslint-disable-line
    const start = user.relevance
      ? Math.max(downvote ? user.relevance.pagerankRawNeg : user.relevance.pagerankRaw, 0)
      : 0;
    this.userNodes[user._id] = {
      start,
      handle: user.handle,
      _id: user._id,
      inputs: {},
      degree: 0,
      postDegree: 0,
      negativeNode: !!downvote,
      type: 'user',
      defaultWeight: user.relevance ? user.relevance.defaultWeight : 0,
      prevPos: user.relevance ? user.relevance.pagerankRaw : 0,
      prevNeg: user.relevance ? user.relevance.pagerankRawNeg : 0
    };
    return this.userNodes[user._id];
  };

  initPostNode = (post, downvote) => {
    if (!post) return null;
    const { _id, data, title } = post;
    if (this.postNodes[_id]) return this.postNodes[_id];

    const start = data
      ? Math.max(downvote ? data.pagerankRawNeg : data.pagerankRaw, 0)
      : 0;
    this.postNodes[_id] = {
      start,
      title,
      _id,
      inputs: {},
      negativeNode: !!downvote,
      type: 'post',
      rank: 0
    };
    return this.postNodes[_id];
  };
}
