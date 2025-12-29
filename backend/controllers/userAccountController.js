const userService = require('../services/userAccountService.js');

const userController = {
  getUsers: async (req, res) => {
    try {
      const result = await userService.getAllUsers(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getStats: async (req, res) => {
    try {
      const stats = await userService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const updatedUser = await userService.modifyUserStatus(id, action);
      res.status(200).json({ message: 'User status updated', user: updatedUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const newUser = await userService.addNewUser(req.body);
      res.status(201).json({ message: 'User created', user: newUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = userController;