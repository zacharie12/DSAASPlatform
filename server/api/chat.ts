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

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`, // 👈 This is where your key is passed
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || 'No response from AI';
    res.json({ message: reply });
  } catch (error) {
    console.error('Error contacting Groq:', error);
    res.status(500).json({ error: 'AI assistant failed to respond' });
  }
};
