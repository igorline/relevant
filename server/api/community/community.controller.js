import Community from './community.model';
import CommunityMember from './community.member.model';
import User from '../user/user.model';

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

export async function showMemebers(req, res, next) {
  try {
    let slug = req.params.slug;
    let admins = await CommunityMember.find({ slug })
    .sort('role reputation');
    res.status(200).json(admins);
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

    // TODO check that admin exists?
    admins = admins.map(admin => ({
      user: admin._id,
      communityId: community._id,
      community: community.slug,
      role: 'admin',
      reputation: 0
    }));

    await CommunityMember.insertMany(admins);

    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    let slug = req.params.slug;
    await Community.findOne({ slug }).remove().exec();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
