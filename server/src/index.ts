import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/db_connection';
import userRoutes from './route/user.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT

// CORS configuration - Allow all in production or specific locally
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running with TypeScript!');
});

// API Routes
import expenseRoutes from './route/expense.routes';

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes); // User typo in request? "expence" vs "expense". Sticking to "expense" for route but maybe 'expences' to match controller? Let's use /api/expenses.

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

