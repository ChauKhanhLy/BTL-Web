const feedbackService = require('../services/feedbackAdminService.js');

const feedbackController = {
  getList: async (req, res) => {
    try {
      const result = await feedbackService.getAllFeedbacks(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await feedbackService.getFeedbackDetail(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  resolve: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await feedbackService.resolveFeedback(id);
      res.status(200).json({ message: 'Feedback resolved', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  reply: async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const result = await feedbackService.replyToFeedback(id, message);
      res.status(200).json({ message: 'Reply sent', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const result = await feedbackService.saveInternalNote(id, note);
      res.status(200).json({ message: 'Note saved', data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = feedbackController;