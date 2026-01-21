import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["hr", "admin", "user", "superadmin"],
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    totalDeposited: {
        type: Number,
        default: 0
    },
    totalRecovered: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model('User', userSchema);
export default User;
