import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; // Ensure this is also ESM

const router = express.Router();

// Configure multer for RAM storage
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

export default router;