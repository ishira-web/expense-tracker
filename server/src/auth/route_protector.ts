import express, { NextFunction } from 'express';
import { verifyAccessToken } from './jwt';

interface AuthRequest extends express.Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: express.Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: express.Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
