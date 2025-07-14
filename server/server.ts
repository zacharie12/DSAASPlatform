import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatHandler } from './api/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration for production
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Chat API route
app.post('/api/chat', chatHandler);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});