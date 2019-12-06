import CommunityMember from 'server/api/community/community.member.model';
import Community from 'server/api/community/community.model';

async function markDeletedMembers() {
  const deletedCom = await Community.find({ inactive: true }, '_id');
  const ids = deletedCom.map(c => c._id);
  return CommunityMember.updateMany(
    { communityId: { $in: ids } },
    { deletedCommunity: true },
    { new: true }
  );
}

async function updateDB() {
  try {
    await markDeletedMembers();
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}

updateDB();
