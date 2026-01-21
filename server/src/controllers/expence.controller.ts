import express from "express";
import User from "../models/user";
import mongoose from "mongoose";
import Expence from "../models/expence";
import { sendDepositEmail, sendLowBalanceEmail } from "../services/email.service";

// Deposit Money (HR Only)
export const depositMoney = async (req: express.Request, res: express.Response) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid userId and positive amount are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Logic: 
        // 1. Add to totalDeposited
        // 2. Add to walletBalance
        // 3. Create a Deposit Record in Expence

        user.totalDeposited = (user.totalDeposited || 0) + Number(amount);
        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        await user.save();

        const depositRecord = new Expence({
            date: new Date(),
            amount: Number(amount),
            description: 'HR Deposit',
            category: 'Others', // Or a dedicated 'Deposit' category if enum allowed, using Others for now as per enum
            user: userId,
            paymentMethod: 'Other',
            balance: user.walletBalance,
            deposit: Number(amount),
            recoverAmount: 0 // No recovery on deposit typically, unless implementing complex debt logic
        });
        await depositRecord.save();

        // Send Email to User
        if (user.email) {
            await sendDepositEmail(user.email, user.name, Number(amount));
        }

        res.status(200).json({
            message: 'Deposit successful',
            walletBalance: user.walletBalance,
            totalDeposited: user.totalDeposited
        });

    } catch (error) {
        console.error('Error depositing money:', error);
        res.status(500).json({ message: 'Failed to deposit money' });
    }
};

// Create New Expence (User)
export const createExpence = async (req: express.Request, res: express.Response) => {
    try {
        const { date, amount, description, category, paymentMethod } = req.body;
        const userId = (req as any).user.id; // From auth middleware
        const file = req.file; // From multer

        if (!date || !amount || !description || !category || !paymentMethod) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Logic:
        // 1. Deduct amount from walletBalance
        // 2. Calculate recoverAmount if balance goes negative

        user.walletBalance = (user.walletBalance || 0) - Number(amount);
        let recoverAmount = 0;
        if (user.walletBalance < 0) {
            recoverAmount = Math.abs(user.walletBalance);
            // Updating totalRecovered could be interpreted as "amount to be recovered" or "amount recovered".
            // User request: "shows the recovery amount from them deposit amount - balance"
            // So we store the CURRENT deficit as recoverAmount for this transaction snapshot.
            // User request: "shows the recovery amount from them deposit amount - balance"
            // So we store the CURRENT deficit as recoverAmount for this transaction snapshot.

            // Send Low Balance Email to HR
            // Find HRs
            const hrs = await User.find({ role: 'hr' });
            const hrEmails = hrs.map(hr => hr.email).filter(email => email) as string[];
            if (hrEmails.length > 0) {
                await sendLowBalanceEmail(hrEmails, user.name, user.walletBalance, user.totalDeposited || 0);
            }
        }
        await user.save();

        const newExpence = new Expence({
            date,
            amount,
            description,
            category,
            user: userId,
            paymentMethod,
            balance: user.walletBalance,
            deposit: 0,
            recoverAmount: recoverAmount,
            proofs: file ? file.path : '' // Cloudinary URL
        });
        await newExpence.save();

        res.status(201).json({ message: 'Expence created successfully', expence: newExpence });
    } catch (error) {
        console.error('Error creating expence:', error);
        res.status(500).json({ message: 'Failed to create expence' });
    }
};



// Update Expence (Keeping existing basic logic, but arguably should revert balance changes? Complexity high. Keeping simple for now as requested)
// Update Expence (With Deposit Logic)
export const updateExpence = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const expence = await Expence.findById(id);
        if (!expence) {
            return res.status(404).json({ message: 'Expence not found' });
        }

        // Helper to adjust wallet if this is a deposit
        if (expence.deposit > 0 && amount !== undefined) {
            const user = await User.findById(expence.user);
            if (user) {
                const diff = Number(amount) - expence.deposit;
                user.walletBalance = (user.walletBalance || 0) + diff;
                user.totalDeposited = (user.totalDeposited || 0) + diff;
                await user.save();

                // Update the deposit field in the expense record itself to match new amount
                // But normally req.body would contain it. If not, we ensure consistency.
                // However, standard update below will take care of updating fields passed in req.body.
                // We just need to ensure we mark it as a deposit update if we are tracking 'deposit' field separate from 'amount'.
                // In this model, 'deposit' field mirrors 'amount' for deposits.
                if (req.body.amount) {
                    req.body.deposit = req.body.amount;
                }
            }
        }

        const updatedExpence = await Expence.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedExpence);
    } catch (error) {
        console.error('Error updating expence:', error);
        res.status(500).json({ message: 'Failed to update expence' });
    }
};

// Delete Expence
// Delete Expence (With Deposit Reversal)
export const deleteExpence = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const expence = await Expence.findById(id);

        if (!expence) {
            return res.status(404).json({ message: 'Expence not found' });
        }

        // If it's a deposit, reverse the wallet balance
        if (expence.deposit > 0) {
            const user = await User.findById(expence.user);
            if (user) {
                user.walletBalance = (user.walletBalance || 0) - expence.deposit;
                user.totalDeposited = (user.totalDeposited || 0) - expence.deposit;
                await user.save();
            }
        }

        await Expence.findByIdAndDelete(id);
        res.status(200).json({ message: 'Expence deleted successfully' });
    } catch (error) {
        console.error('Error deleting expence:', error);
        res.status(500).json({ message: 'Failed to delete expence' });
    }
};

//Expence List By User

export const getExpenceListByUser = async (req: express.Request, res: express.Response) => {
    try {
        const userId = (req as any).user.id;
        const role = (req as any).user.role;

        let query: any = {};
        if (role === 'user') {
            query = { user: userId };
        } else {
            // HR/Admin/Superadmin can filter by userId if provided in query
            const userIdQuery = req.query.userId as string;
            if (userIdQuery && userIdQuery.trim()) {
                query = { user: new mongoose.Types.ObjectId(userIdQuery.trim()) };
            }
        }

        const expences = await Expence.find(query).sort({ date: -1 }).populate('user', 'name email');
        res.status(200).json(expences);
    } catch (error) {
        console.error('Error fetching expences:', error);
        res.status(500).json({ message: 'Failed to fetch expences' });
    }
};
