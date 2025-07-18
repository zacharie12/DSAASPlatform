import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatHandler } from './api/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
// Allow requests from the configured client URL when running in production.
// Fallback to localhost for local development.
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
console.log('Allowing CORS from:', allowedOrigin);
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Chat API route
app.post('/api/chat', chatHandler);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
