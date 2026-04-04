import express from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @access Public
 * @description Register a new user
 */
authRouter.post('/register', authCtrl.registerUser);
/**
 * @route POST /api/auth/login
 * @access Public
 * @description Login user
 */
authRouter.post('/login', authCtrl.authUser);
/**
 * @route POST /api/auth/logout
 * @access Private
 * @description Logout user
 */
authRouter.post('/logout', authCtrl.logoutUser);
/**
 * @route GET /api/auth/profile
 * @access Private
 * @description Get user profile
 */
authRouter.get('/profile', protect, authCtrl.getUserProfile);

export default authRouter;
