import axios from 'axios';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const sendChatMessage = async (messages: ChatMessage[]): Promise<ChatResponse> => {
  try {
    console.log('Sending chat request:', messages);
    
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
    const response = await axios.post(`${apiUrl}/api/chat`, {
      messages
    });
    console.log("Chat API response:", response.data);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle different error types with specific messages
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('API Error Details:', {
        status,
        data: errorData,
        headers: error.response.headers
      });
      
      // Return specific error messages based on status code
      switch (status) {
        case 400:
          return {
            success: false,
            error: 'Invalid request to AI service. Please try rephrasing your message.'
          };
        case 401:
          return {
            success: false,
            error: 'Invalid API key or permission denied. Please contact support.'
          };
        case 429:
          return {
            success: false,
            error: 'Too many requests. Please wait a moment and try again.'
          };
        case 500:
          return {
            success: false,
            error: 'LLM server error — try again shortly.'
          };
        default:
          return {
            success: false,
            error: errorData?.error || 'Oops! AI assistant failed to respond.'
          };
      }
    }
    
    // Network or other errors
    return {
      success: false,
      error: 'Failed to connect to AI assistant. Please check your connection and try again.'
    };
  }
};
