import mongoose from 'mongoose';
import User from './src/models/user';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const users = [
            {
                name: 'Regular User',
                email: 'user@example.com',
                password: 'password123',
                role: 'user',
                walletBalance: 1000
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
                walletBalance: 5000
            },
            {
                name: 'HR User',
                email: 'hr@example.com',
                password: 'password123',
                role: 'hr',
                walletBalance: 0
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists. Updating...`);
                // Update password just in case (hashing it)
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                existingUser.password = hashedPassword;
                existingUser.role = userData.role as 'user' | 'admin' | 'hr' | 'superadmin';
                existingUser.name = userData.name;
                // Don't reset wallet balance if exists, or do? Let's keep it if exists, else set default.
                // Actually for demo purposes, let's reset it if we want a fresh start, but maybe safer to leave it.
                // The prompt implies "create", so ensure they exist.
                await existingUser.save();
                console.log(`Updated ${userData.email}`);
            } else {
                console.log(`Creating ${userData.email}...`);
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const newUser = new User({
                    ...userData,
                    password: hashedPassword
                });
                await newUser.save();
                console.log(`Created ${userData.email}`);
            }
        }

        console.log('All demo users created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
