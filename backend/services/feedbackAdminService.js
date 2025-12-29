const feedbackDAL = require('../dal/feedbackAdmin.dal.js');

const feedbackService = {
  async getAllFeedbacks(query) {
    return await feedbackDAL.getFeedbacks({
      search: query.search,
      type: query.type
    });
  },

  async getFeedbackDetail(id) {
    return await feedbackDAL.getFeedbackById(id);
  },

  async resolveFeedback(id) {
    return await feedbackDAL.updateFeedback(id, { 
      status: 'Đã đóng' 
    });
  },

  async replyToFeedback(id, replyText) {
    return await feedbackDAL.updateFeedback(id, { 
      reply_text: replyText,
      status: 'Đã phản hồi'
    });
  },

  async saveInternalNote(id, note) {
    return await feedbackDAL.updateFeedback(id, { 
      internal_note: note 
    });
  }
};

module.exports = feedbackService;