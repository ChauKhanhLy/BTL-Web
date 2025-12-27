const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/feedbacks', adminController.getFeedbacks);
router.patch('/feedbacks/:id/resolve', adminController.resolveFeedback);
router.post('/feedbacks/:id/reply', adminController.replyFeedback);

module.exports = router;