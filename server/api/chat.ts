import express from 'express';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const chatHandler = async (req: express.Request, res: express.Response) => {
  const messages: ChatMessage[] = req.body.messages;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY in environment' });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    res.json({ message: reply || 'No response from AI model' });
  } catch (error: any) {
    console.error('Groq API Error:', error?.response?.data || error.message);

    res.status(error?.response?.status || 500).json({
      error:
        error?.response?.data?.error?.message ||
        'LLM server error — try again shortly.',
    });
  }
};
