import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Main ChatBot component
const MentalHealthChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your mental health companion. How can I assist you today? I can help with wellness recommendations, tell you about our products, or connect you with treatment resources.",
      sender: 'bot',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(true);
  const messagesEndRef = useRef(null);
//   const [apiKey, setApiKey] = useState(''); // For demo purposes, in production use environment variables

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  // Predefined suggestions
  const suggestions = [
    "I'm feeling stressed with exams",
    "What products do you recommend for anxiety?",
    "Tell me about your treatment options",
    "Do you have self-care kits?",
  ];

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle user input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
    setIsSuggestionsVisible(false);
  };

  // Process message and get response from OpenAI
  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Create context for the AI about your app's purpose
      const context = `
        You are a helpful assistant for a mental health application specifically for students.
        The app sells mental health products like T-shirts with positive messages, caps, 
        self-awareness kits, and also offers various mental health treatments and resources.
        Focus on being supportive, empathetic, and directing students to appropriate products
        or treatments based on their needs. Keep responses concise and helpful.
      `;
      
      // Call OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo', // Using latest model, adjust as needed
          messages: [
            { role: 'system', content: context },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: messageText },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      
      // Add AI response to chat
      const botMessage = {
        id: messages.length + 2,
        text: response.data.choices[0].message.content,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please try again or contact support if this persists.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };
  
  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle API key update
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Student Mental Health Companion</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-white text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
              Products
            </button>
            <button className="bg-white text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
              Treatments
            </button>
            <button className="bg-white text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
              Resources
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 overflow-hidden flex flex-col">
        {/* API Key Input (would typically be handled via environment variables in production) */}
        {/* <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key 
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your OpenAI API key"
          />
          <p className="text-xs text-gray-500 mt-1">
            In production, this would be securely stored in environment variables.
          </p>
        </div>
         */}
        {/* Chat container */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-teal-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-75 block mt-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none max-w-xs lg:max-w-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {isSuggestionsVisible && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded-full transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isLoading || !apiKey}
              />
              <button
                type="submit"
                className={`bg-teal-500 text-white px-4 py-2 rounded-r-lg ${
                  isLoading || !apiKey || !input.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-teal-600'
                }`}
                disabled={isLoading || !apiKey || !input.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            {!apiKey && (
              <p className="text-red-500 text-xs mt-1">
                Please enter your OpenAI API key to start chatting
              </p>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © 2025 Student Mental Health App. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-teal-600">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-teal-600">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 hover:text-teal-600">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MentalHealthChatbot;