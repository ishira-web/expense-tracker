import express from 'express'
import { createUser, deleteUser, login, forgotPassword, resetPassword, getUserById, updateProfile, getAllUsers, getMe } from '../controllers/user.controller'

import { protect, restrictTo } from '../auth/route_protector';

const router = express.Router()

// Public routes
router.post('/register', createUser) // Keep public for self-registration
router.post('/login', login)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile); // Authenticated user can update their profile
router.post('/create', protect, restrictTo('hr', 'admin', 'superadmin'), createUser); // Admin/HR creation
router.get('/:id', protect, restrictTo('hr', 'admin', 'superadmin'), getUserById);
router.get('/all/list', protect, restrictTo('hr', 'admin', 'superadmin'), getAllUsers); // Changed to /all/list to avoid conflict with /:id, or just place before /:id
router.delete('/delete/:id', protect, restrictTo('admin', 'superadmin'), deleteUser)

export default router;