'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  sources?: string[];
  scriptureReferences?: string[];
  topic?: string;
  difficulty?: string;
}

interface ApologeticsChatProps {
  className?: string;
}

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Example questions for Christian apologetics
const exampleQuestions: string[] = [];

export default function ApologeticsChat({ className = '' }: ApologeticsChatProps) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // true = dark theme, false = light theme
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Apply theme to document body
  useEffect(() => {
    document.body.style.backgroundColor = isDarkTheme ? '#000000' : '#ffffff';
    document.body.style.color = isDarkTheme ? '#ffffff' : '#000000';
  }, [isDarkTheme]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Also update the document body background
    document.body.style.backgroundColor = !isDarkTheme ? '#000000' : '#ffffff';
    document.body.style.color = !isDarkTheme ? '#ffffff' : '#000000';
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send message to your backend API
      const response = await fetch('https://christtask-backend.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      console.log('API Response data:', data);
      console.log('Answer field:', data.answer);
      console.log('Response field:', data.response);

      // Update loading message with actual response
      const assistantMessage: ChatMessage = {
        id: loadingMessage.id,
        role: 'assistant',
        content: data.answer || data.response || 'No response received', // Try 'answer' first, fallback to 'response'
        timestamp: new Date(),
        sources: data.sources,
        scriptureReferences: data.scriptureReferences,
        topic: data.topic,
        difficulty: data.difficulty,
      };
      
      console.log('Assistant message content:', assistantMessage.content);

      setMessages(prev => 
        prev.map(msg => msg.id === loadingMessage.id ? assistantMessage : msg)
      );

    } catch (error) {
      console.error('Error sending message:', error);
      // Update loading message with error
      const errorMessage: ChatMessage = {
        id: loadingMessage.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => 
        prev.map(msg => msg.id === loadingMessage.id ? errorMessage : msg)
      );
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        sendMessage(inputValue);
      }
    }
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} ${className}`} style={{ backgroundColor: isDarkTheme ? '#000000' : '#ffffff' }}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkTheme ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'} mt-12`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <span className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>CA</span>
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>ChristTask</h2>
            <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Debate ready?</p>
          </div>
        </div>
      </div>

      {/* Desktop centering container - account for sidebar */}
      <div className="flex justify-center md:-ml-16">
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4">
          {/* Messages Area */}
          <div className="p-3 sm:p-4 space-y-4 messages-container">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <span className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>ChristTask</span>
                </div>
                <p className={`mb-6 text-sm sm:text-base ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Debate Ready?</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500 ease-out`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    message.role === 'user' 
                      ? isDarkTheme ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                      : isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'
                  }`}>
                    {message.role === 'user' ? 'U' : 'ChristTask'}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 relative break-words ${
                    message.role === 'user'
                      ? isDarkTheme ? 'bg-gray-600 text-white' : 'bg-blue-500 text-white'
                      : isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0.1s' }}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Typing...</span>
                      </div>
                    ) : (
                      <div>
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">{message.content}</div>
                        

                        
                        {/* Scripture References */}
                        {message.scriptureReferences && message.scriptureReferences.length > 0 && (
                          <div className="mt-2">
                            <div className={`text-xs font-medium mb-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Scripture References:</div>
                            <div className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                              {message.scriptureReferences.join(', ')}
                            </div>
                          </div>
                        )}
                        
                        {/* Topic and Difficulty */}
                        {(message.topic || message.difficulty) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.topic && (
                              <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                                {message.topic}
                              </span>
                            )}
                            {message.difficulty && (
                              <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">
                                {message.difficulty}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </div>
                        
                        {/* Copy Button - Only for chatbot messages */}
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className={`absolute bottom-2 right-2 p-1.5 rounded-md text-xs transition-all duration-200 ${
                              isDarkTheme 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
                            }`}
                            title="Copy message"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            

            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Claude Style */}
      <div className={`pt-3 pb-6 px-6 chat-input-area ${isDarkTheme ? 'bg-black' : 'bg-white'} pb-20 md:pb-6`} style={{ backgroundColor: isDarkTheme ? '#000000' : '#ffffff' }}>
        <div className="w-full max-w-2xl lg:max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Christian apologetics..."
              className="w-full rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base break-words"
              rows={2}
              disabled={isLoading}
              style={{
                resize: 'none',
                overflow: 'hidden',
                minHeight: '56px',
                padding: '16px 20px',
                fontSize: '16px',
                lineHeight: '1.5',
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isDarkTheme ? '#ffffff' : '#000000',
                border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute disabled:cursor-not-allowed transition-all duration-200 rounded-full flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
                right: '8px',
                bottom: '8px',
                backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                color: isDarkTheme ? '#ffffff' : '#000000',
                border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M8 8h8" />
              </svg>
            </button>
          </form>
          
          {/* Theme Toggle Button - Beneath the chat input */}
          <div className="flex justify-center mt-4">
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isDarkTheme 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkTheme ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm">Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-sm">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 