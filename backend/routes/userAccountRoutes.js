const express = require('express');
const router = express.Router();
const userController = require('../controllers/userAccountController.js');

router.get('/', userController.getUsers);
router.get('/stats', userController.getStats);
router.post('/', userController.createUser);
router.put('/:id/status', userController.updateStatus);

module.exports = router;