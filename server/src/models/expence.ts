import mongoose from "mongoose";

export default mongoose.model("Expence", new mongoose.Schema({

    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Food", "Transport","Others"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["Cash", "Card", "Online", "Other"],
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deposit: {
        type: Number,
        default: 0
    },
    recoverAmount: {
        type: Number,
        default: 0
    },
    proofs : {
        type: String,
        
    }
}))