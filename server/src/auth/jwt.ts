import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY || 'default_session_secret_key';

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
};

export const generateSessionToken = (payload: object) => {
    return jwt.sign(payload, SESSION_SECRET_KEY, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY);
};

export const verifySessionToken = (token: string) => {
    return jwt.verify(token, SESSION_SECRET_KEY);
};



