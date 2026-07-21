import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './config/db';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.send({ status: 'good response' });
});

async function start() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on ${PORT}`);
    });
}

start();
