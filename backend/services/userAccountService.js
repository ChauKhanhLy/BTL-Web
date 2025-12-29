const userDAL = require('../dal/userAccount.dal.js');

const userService = {
  async getAllUsers(query) {
    try {
      return await userDAL.getUsers({
        status: query.status,
        search: query.search,
        page: parseInt(query.page),
        limit: parseInt(query.limit)
      });
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  },

  async getStats() {
    try {
      return await userDAL.getUserStats();
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  },

  async modifyUserStatus(userId, action) {
    let status;
    switch (action) {
      case 'verify': status = 'Verified'; break;
      case 'suspend': status = 'Suspended'; break;
      case 'unsuspend': status = 'Verified'; break;
      default: throw new Error('Invalid action');
    }
    return await userDAL.updateUserStatus(userId, status);
  },

  async addNewUser(userData) {
    return await userDAL.createUser({
      ...userData,
      role: 'customer', 
      status: 'Unverified' 
    });
  }
};

module.exports = userService;