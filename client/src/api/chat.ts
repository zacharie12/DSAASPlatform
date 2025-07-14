export const sendChatMessage = async (messages: ChatMessage[]): Promise<ChatResponse> => {
   try {
     console.log('Sending chat request:', messages);
     
     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
     const response = await axios.post(`${apiUrl}/api/chat`, {
       messages
     });
   }
}