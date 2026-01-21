import mongoose from 'mongoose';
import User from './src/models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    let admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
        admin = new User({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        await admin.save();
    } else {
        admin.role = 'admin';
        await admin.save();
    }
    
    const payload = { id: admin._id, role: admin.role };
    const token = jwt.sign(payload, process.env.SECRET_KEY || 'SecretKey20260116', { expiresIn: '15m' });
    fs.writeFileSync('params.json', JSON.stringify({ token, userId: admin._id }));
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
