import express from 'express';
import { createExpence, deleteExpence, depositMoney, getExpenceListByUser, updateExpence } from '../controllers/expence.controller';
import { protect, restrictTo } from '../auth/route_protector';
import { upload } from '../configs/cloudinary';

const router = express.Router();

// Public/Protected Routes

// Get Expenses (User sees own, HR/Admin sees all)
router.get('/', protect, getExpenceListByUser);

// Create Expense (User only, with file upload)
router.post('/create', protect, restrictTo('user'), upload.single('proof'), createExpence);

// Deposit (HR/Admin only)
router.post('/deposit', protect, restrictTo('hr', 'admin', 'superadmin'), depositMoney);

// Update/Delete (Optional permissions, keeping open for now or restricted)
router.put('/:id', protect, updateExpence); // Maybe restrict to User/Admin?
router.delete('/:id', protect, restrictTo('admin', 'superadmin'), deleteExpence);

export default router;
