'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';


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
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Removed auto-scroll to let users read answers from start to finish
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages, scrollToBottom]);

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

  // Audio speech synthesis functions
  const speakMessage = (messageId: string, content: string) => {
    // Stop any currently speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(content);
    
    // Enhanced settings for more human-like speech
    utterance.rate = 0.85; // Slightly slower for more natural pace
    utterance.pitch = 1.1; // Slightly higher pitch for more warmth
    utterance.volume = 1;
    
    // Wait for voices to load if needed
    const getVoices = () => {
      return new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
          };
        }
      });
    };

    // Enhanced voice selection for more human-like speech
    getVoices().then(voices => {
      // Priority order for more natural voices
      const voicePriority = [
        // Google voices (usually more natural)
        voice => voice.name.includes('Google') && voice.lang.includes('en'),
        // Microsoft voices (often good quality)
        voice => voice.name.includes('Microsoft') && voice.lang.includes('en'),
        // Apple voices (good on Mac)
        voice => voice.name.includes('Samantha') || voice.name.includes('Alex'),
        // Any English voice with 'natural' in the name
        voice => voice.name.toLowerCase().includes('natural') && voice.lang.includes('en'),
        // Any English voice
        voice => voice.lang.includes('en'),
        // Fallback to any voice
        voice => true
      ];

      let selectedVoice = null;
      for (const priority of voicePriority) {
        selectedVoice = voices.find(priority);
        if (selectedVoice) break;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name);
      }

      utterance.onstart = () => {
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSpeakingMessageId(null);
        toast({
          title: "Audio Error",
          description: "Unable to play audio. Please try again.",
          variant: "destructive",
        });
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Enhanced copy function with better error handling and feedback
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      
      // Show success toast
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
        duration: 2000,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedMessageId(messageId);
        toast({
          title: "Copied!",
          description: "Message copied to clipboard",
          duration: 2000,
        });
        
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        toast({
          title: "Copy failed",
          description: "Unable to copy message to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} ${className}`} style={{ backgroundColor: isDarkTheme ? '#000000' : '#ffffff' }}>
      {/* Header */}
      <div className={`py-3 px-4 border-b ${isDarkTheme ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <span className={`text-xs font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>CA</span>
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>ChristTask</h2>
            </div>
          </div>
          
          {/* Theme Toggle Button - Top right */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 ${
              isDarkTheme 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
            title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkTheme ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-xs">Light</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-xs">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop centering container - account for sidebar */}
      <div className="flex justify-center md:-ml-16">
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4">
          {/* Messages Area */}
          <div className="p-3 sm:p-4 space-y-4 messages-container mt-8 md:mt-16">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12 px-4">
                <p className={`mb-6 text-sm sm:text-base ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Start a conversation with Debate AI Chat!</p>
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
                        
                        {/* Action Buttons - Only for chatbot messages */}
                        {message.role === 'assistant' && (
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            {/* Audio Button */}
                            <button
                              onClick={() => speakingMessageId === message.id 
                                ? stopSpeaking() 
                                : speakMessage(message.id, message.content)
                              }
                              className={`p-1.5 rounded-md text-xs transition-all duration-200 flex items-center gap-1 ${
                                isDarkTheme 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
                              } ${speakingMessageId === message.id ? 'bg-blue-600 text-white' : ''}`}
                              title={speakingMessageId === message.id ? "Stop audio" : "Play audio"}
                            >
                              {speakingMessageId === message.id ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Stop
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                  Audio
                                </>
                              )}
                            </button>
                            
                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              className={`p-1.5 rounded-md text-xs transition-all duration-200 flex items-center gap-1 ${
                                isDarkTheme 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
                              } ${copiedMessageId === message.id ? 'bg-green-600 text-white' : ''}`}
                              title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Copied
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
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
      <div className={`pt-3 px-6 chat-input-area ${isDarkTheme ? 'bg-black' : 'bg-white'}`} style={{ backgroundColor: isDarkTheme ? '#000000' : '#ffffff' }}>
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
        </div>
      </div>
    </div>
  );
} 