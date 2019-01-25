import Community from './community.model';
import CommunityMember from './community.member.model';
import User from '../user/user.model';

// Community.update({}, { currentShares: 0, postCount: 0 }, { multi: true }).exec();

const RESERVED = [
  'user',
  'admin',
  'info',
  'api',
  'img',
  'fonts',
  'files',
  'home',
  'undefined'
];

export async function findOne(req, res, next) {
  try {
    const { slug } = req.params;
    const community = await Community.findOne({ slug });
    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
}

export async function index(req, res, next) {
  try {
    const communties = await Community.find({});
    res.status(200).json(communties);
  } catch (err) {
    next(err);
  }
}

// CommunityMember.find()
// .then(all => all.map(c => console.log(c.toObject())));

export async function members(req, res, next) {
  try {
    const limit = req.params.limit || 20;
    const community = req.params.slug;
    const users = await CommunityMember.find({ community }).sort('role reputation')
    .limit(limit);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export async function membership(req, res, next) {
  try {
    const user = req.user._id;
    const m = await CommunityMember.find({ user }).sort('role reputation');
    res.status(200).json(m);
  } catch (err) {
    next(err);
  }
}

export async function join(req, res, next) {
  try {
    const userId = req.user._id;
    const { slug } = req.params;
    const community = await Community.findOne({ slug });
    const member = await community.join(userId);
    res.status(200).json(member);
  } catch (err) {
    next(err);
  }
}

export async function leave(req, res, next) {
  try {
    const userId = req.user._id;
    const { slug } = req.params;
    const community = await Community.findOne({ slug });
    await community.leave(userId);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

export async function showAdmins(req, res, next) {
  try {
    const { slug } = req.params;
    const admins = await CommunityMember.find({ slug, role: 'admin' });
    res.status(200).json(admins);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    // for no only admins create communities
    // TODO relax this and community creator as admin
    if (!req.user || !req.user.role === 'admin') {
      throw new Error("You don't have permission to create a community");
    }
    let community = req.body;
    let { admins } = community;
    admins = await User.find({ handle: { $in: admins } }, '_id');
    community.slug = community.slug.toLowerCase();
    if (RESERVED.indexOf(community.slug) > -1) throw new Error('Reserved slug');
    if (!admins || !admins.length) throw new Error('Please set community admins');
    community = new Community(community);
    community = await community.save();

    // TODO - this should create an invitation!
    admins = admins.map(async admin => {
      try {
        return await community.join(admin._id, 'admin');
      } catch (err) {
        throw err;
      }
    });

    admins = await Promise.all(admins);

    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('deleting communities is disabled in production');
    }
    const userId = req.user._id;
    const { slug } = req.params;
    // check that user is an admin
    const admin = CommunityMember.findOne({
      community: slug,
      user: userId,
      role: 'admin'
    });
    if (!admin) throw new Error("you don't have permission to delete this community");
    // funky syntax - need this to trigger remove
    (await Community.findOne({ slug })).remove();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
