import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatHandler } from './api/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration for production
console.log('Allowing CORS from:', process.env.CLIENT_URL);
app.use(cors({
  origin: 'https://dsaasplatform-1.onrender.com',
  credentials: true
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
