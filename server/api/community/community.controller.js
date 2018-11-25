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
  'undefined',
];

export async function index(req, res, next) {
  try {
    let communties = await Community.find({});
    res.status(200).json(communties);
  } catch (err) {
    next(err);
  }
}

export async function members(req, res, next) {
  try {
    let community = req.params.slug;
    let users = await CommunityMember.find({ community })
    .sort('role reputation');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export async function membership(req, res, next) {
  try {
    let user = req.user._id;
    let m = await CommunityMember.find({ user })
    .sort('role reputation');
    res.status(200).json(m);
  } catch (err) {
    next(err);
  }
}


export async function join(req, res, next) {
  try {
    let userId = req.user._id;
    let slug = req.params.slug;
    let community = await Community.findOne({ slug });
    let member = await community.join(userId);
    res.status(200).json(member);
  } catch (err) {
    next(err);
  }
}

export async function leave(req, res, next) {
  try {
    let userId = req.user._id;
    let slug = req.params.slug;
    let community = await Community.findOne({ slug });
    await community.leave(userId);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}


export async function showAdmins(req, res, next) {
  try {
    let slug = req.params.slug;
    let admins = await CommunityMember.find({ slug, role: 'admin' });
    res.status(200).json(admins);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    // for no only admins create communities
    // TODO relax this and community creator as admin
    if (!req.user || !req.user.role === 'admin') throw new Error('You don\'t have permission to create a community');
    let community = req.body;
    let admins = community.admins;
    admins = await User.find({ _id: { $in: admins } }, '_id');
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
        console.log('error adding admin ', err);
        return null;
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
    if (process.env.NODE_ENV !== 'test') throw new Error('deleting communities is disabled in production');
    let userId = req.user._id;
    let slug = req.params.slug;
    // check that user is an admin
    let admin = CommunityMember.findOne({ community: slug, user: userId, role: 'admin' });
    if (!admin) throw new Error('you don\'t have permission to delete this community');
    // funky syntax - need this to trigger remove
    (await Community.findOne({ slug })).remove();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
