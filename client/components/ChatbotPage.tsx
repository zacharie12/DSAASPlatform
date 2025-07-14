import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Bot, User, Send, FileText, TrendingUp, Package, DollarSign } from 'lucide-react';
import { sendChatMessage, ChatMessage as APIChatMessage } from '../api/chat';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface CSVData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

interface ChatbotPageProps {
  onCreateModel: (type: 'inventory' | 'price' | 'product', csvData: CSVData) => { success: boolean; message: string | null };
  persistedData?: CSVData | null;
  createdModelTypes: Set<string>;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ onCreateModel, persistedData, createdModelTypes }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "👋 Welcome! I'm your AI assistant. To get started, please upload your business data (CSV format) and I'll help you choose the best AI optimization for your needs.",
      timestamp: new Date()
    }
  ]);
  const [csvData, setCsvData] = useState<CSVData | null>(persistedData || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTypes, setProcessingTypes] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (persistedData && !csvData) {
      setCsvData(persistedData);
      // Add messages to show the data is already uploaded
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: `📁 Uploaded: ${persistedData.fileName}`, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), type: 'bot', content: "Great! I've analyzed your data. Based on what I see, here are three AI optimizations I can help you with. Which one interests you most?", timestamp: new Date() }
      ]);
    }
  }, [persistedData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'bot' | 'user', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsTyping(true);

    try {
      // Prepare conversation context
      const systemPrompt = csvData 
        ? `You are a helpful AI assistant that helps clients understand what can be done with their uploaded business data. The user has uploaded a CSV file named "${csvData.fileName}" with columns: ${csvData.headers.join(', ')}. Help them understand how AI can optimize their business using this data.`
        : "You are a helpful AI assistant that helps clients understand what can be done with their uploaded business data. Guide them to upload their data first, then suggest AI optimizations.";

      // Convert chat messages to API format, filtering out unwanted messages
      const conversationMessages: APIChatMessage[] = messages
        .slice(1) // Skip the initial bot welcome message
        .filter(msg => {
          // Filter out file upload messages and other non-chat content
          return !msg.content.startsWith('📁 Uploaded:') && 
                 !msg.content.includes('Great! I\'ve analyzed your data') &&
                 msg.content.trim().length > 0;
        })
        .map(msg => ({
          role: msg.type === 'bot' ? 'assistant' as const : 'user' as const,
          content: msg.content
        }));

      const apiMessages: APIChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationMessages,
        { role: 'user', content: userMessage }
      ];

      console.log('Sending messages to API:', apiMessages);
      const response = await sendChatMessage(apiMessages);
      
      if (response.success && response.message) {
        addMessage('bot', response.message);
      } else {
        addMessage('bot', response.error || 'Oops! AI assistant failed to respond. Try again in a few seconds.');
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('bot', 'Oops! AI assistant failed to respond. Try again in a few seconds.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const parseCSV = (csvText: string): { headers: string[]; rows: string[][] } => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1, 6).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    return { headers, rows };
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    // Validate file
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file only.');
      setIsUploading(false);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      setIsUploading(false);
      return;
    }

    try {
      const text = await file.text();
      const { headers, rows } = parseCSV(text);
      
      const newCsvData: CSVData = {
        headers,
        rows,
        fileName: file.name
      };
      
      setCsvData(newCsvData);
      addMessage('user', `📁 Uploaded: ${file.name}`);
      
      // Bot response after upload
      setTimeout(() => {
        addMessage('bot', "Great! I've analyzed your data. Based on what I see, here are three AI optimizations I can help you with. Which one interests you most?");
      }, 1000);
      
    } catch (err) {
      setError('Error parsing CSV file. Please ensure it\'s properly formatted.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleOptimizationChoice = (type: 'inventory' | 'price' | 'product', label: string) => {
    if (!csvData) return;

    // Immediately check if this type is already created or being processed
    if (createdModelTypes.has(type) || processingTypes.has(type)) {
      addMessage('user', `I choose: ${label}`);
      setTimeout(() => {
        addMessage('bot', "This model is already being prepared or exists. Check your Models page!");
      }, 1000);
      return;
    }

    // Immediately mark this type as being processed to prevent race conditions
    setProcessingTypes(prev => new Set([...prev, type]));

    addMessage('user', `I choose: ${label}`);
    
    setTimeout(() => {
      const result = onCreateModel(type, csvData);
      
      // Remove from processing set after creation attempt
      setProcessingTypes(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
      
      if (result.success) {
        addMessage('bot', "Perfect choice! 🚀 I'm creating your AI model now. Our data science team will train it with your data and you'll see results soon in your Models page.");
      } else {
        addMessage('bot', result.message || "This model is already in progress.");
      }
    }, 1000);
  };

  const optimizationOptions = [
    {
      type: 'inventory' as const,
      label: 'Inventory Optimization',
      description: 'Optimize stock levels to reduce costs while maintaining service levels',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      type: 'price' as const,
      label: 'Price Recommendation',
      description: 'AI-powered pricing strategies to maximize revenue and competitiveness',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      type: 'product' as const,
      label: 'Product Recommendation',
      description: 'Personalized product recommendations to increase customer engagement',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-500">Your intelligent business optimization guide</p>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={csvData ? "Ask me about your data or AI optimizations..." : "Upload your data first, then ask me questions..."}
                  disabled={isTyping}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {isTyping && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isTyping ? 'Thinking...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'bot' ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-lg ${
                message.type === 'bot' 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-blue-600 text-white'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'bot' ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Area (shown when no CSV uploaded) */}
        {!csvData && (
          <div className="flex justify-start">
            <div className="max-w-2xl w-full">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Upload className={`w-10 h-10 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isUploading ? 'Processing...' : 'Upload your business data'}
                    </p>
                    <p className="text-gray-500">
                      Drop your CSV file here or click to browse
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>Supports: CSV files (max 10MB)</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Preview (shown after upload) */}
        {csvData && (
          <div className="flex justify-start">
            <div className="max-w-4xl w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Data Preview: {csvData.fileName}</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {csvData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                          >
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Options (shown after data upload) */}
        {csvData && (
          <div className="flex justify-start">
            <div className="max-w-2xl w-full space-y-3">
              {optimizationOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleOptimizationChoice(option.type, option.label)}
                    disabled={createdModelTypes.has(option.type) || processingTypes.has(option.type)}
                    className={`w-full p-4 border border-gray-200 rounded-lg transition-all duration-200 text-left ${
                      createdModelTypes.has(option.type) || processingTypes.has(option.type)
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                        : 'bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        {(createdModelTypes.has(option.type) || processingTypes.has(option.type)) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {createdModelTypes.has(option.type) ? 'Already created' : 'Being prepared...'}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatbotPage;