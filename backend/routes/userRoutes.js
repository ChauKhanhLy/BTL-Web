import express from "express";
import { forgotPassword, resetPassword } from "../controllers/userController.js";
const userController = require('../controllers/userController');

const router = express.Router();

router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);
router.get('/', userController.getUsers);
router.put('/:id/status', userController.updateUserStatus);
router.post('/:id/invite', userController.sendInvite);

module.exports = router;
export default router;
