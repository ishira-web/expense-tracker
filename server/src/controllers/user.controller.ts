import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import { generateAccessToken, generateSessionToken } from '../auth/jwt';

// Create New User (Protected - Admin/HR only for role assignment, or Public for basic registration)
export const createUser = async (req: express.Request, res: express.Response) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine role:
        // If request is authenticated and user is Admin/SuperAdmin, allow setting any role.
        // If HR, allow setting 'user'.
        // Otherwise (public registration), default to 'user'.

        let assignedRole = 'user';

        if ((req as any).user) {
            const requesterRole = (req as any).user.role;
            if (requesterRole === 'admin' || requesterRole === 'superadmin') {
                if (role && ['user', 'hr', 'admin'].includes(role)) {
                    assignedRole = role;
                }
            } else if (requesterRole === 'hr') {
                // HR can create users
                assignedRole = 'user';
            }
        }
        // If public registration, ignored role input for security, stays 'user'

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role: assignedRole });
        await newUser.save();

        // If created by an admin/hr, we might not want to return a token for the NEW user to auto-login the admin.
        // But the original code returned a token.
        // If it's a public registration, return token.
        // If authenticated request, maybe just return success message?
        if ((req as any).user) {
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } else {
            const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY || '');
            res.status(201).json({ token });
        }

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user' });
    }
};

// Login User
export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const sessionToken = generateSessionToken({ id: user._id, role: user.role });

        res.status(200).json({
            accessToken,
            sessionToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
};

// Forgot Password
export const forgotPassword = async (req: express.Request, res: express.Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token (simple random string for demo, or JWT)
        const resetToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY || '', { expiresIn: '1h' });

        // In a real app, send email here.
        // For this demo, we'll return the token in the response so the user can "click" it.
        console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);

        res.status(200).json({ message: 'Password reset link generated', token: resetToken });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Failed to process request' });
    }
};

// Reset Password
export const resetPassword = async (req: express.Request, res: express.Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY || '');
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};


// Get User By ID
export const getUserById = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

// Delete User
export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

// Update Profile (Name only)
export const updateProfile = async (req: express.Request, res: express.Response) => {
    try {
        const userId = (req as any).user.id; // From auth middleware
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Only allow updating name, ignore email or other fields if sent
        const user = await User.findByIdAndUpdate(
            userId,
            { name },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// Get Current User Profile
export const getMe = async (req: express.Request, res: express.Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

// Get All Users (Admin/HR/Superadmin)
export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
