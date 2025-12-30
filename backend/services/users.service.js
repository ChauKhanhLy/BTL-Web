const userDal = require('../dal/users.dal.js');

const fetchUsers = async (query) => {
  const users = await userDal.getAllUsers(query);
  const stats = await userDal.getUserStats();
  return { users, stats };
};

const changeUserStatus = async (userId, action) => {
  let newStatus;
  switch (action) {
    case 'verify': newStatus = 'Verified'; break;
    case 'suspend': newStatus = 'Suspended'; break;
    case 'unlock': newStatus = 'Verified'; break;
    default: throw new Error("Invalid action");
  }
  return await userDal.updateUserStatus(userId, newStatus);
};

const inviteUser = async (userId) => {
  const user = await userDal.getAllUsers({ id: userId });
  console.log(`Sending email to ${user.gmail}...`);
  return { message: "Invitation sent successfully" };
};

module.exports = {
  fetchUsers,
  changeUserStatus,
  inviteUser
};