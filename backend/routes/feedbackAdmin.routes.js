const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackAdmin.controller.js');

router.get('/', feedbackController.getList);
router.get('/:id', feedbackController.getDetail);
router.put('/:id/resolve', feedbackController.resolve);
router.put('/:id/reply', feedbackController.reply);
router.put('/:id/note', feedbackController.addNote);

module.exports = router;