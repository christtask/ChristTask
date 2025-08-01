import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

// Example questions for Christian apologetics
const exampleQuestions = [
  "How do we know God exists?",
  "What about the problem of evil and suffering?",
  "Is the Bible historically reliable?",
  "How do we know Jesus rose from the dead?",
  "What about other religions?",
  "How do you respond to atheist arguments?"
];

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

interface AIChatbotProps {
  onSendMessage?: (message: string) => Promise<string>;
  className?: string;
  placeholder?: string;
  title?: string;
  aiName?: string;
  userAvatar?: string;
  aiAvatar?: string;
}

// Initial Input Box Component (Before first message)
const InitialInputBox = ({ onSend, placeholder, isLoading }: {
  onSend: (message: string) => void;
  placeholder: string;
  isLoading: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    onSend(inputValue.trim());
    setInputValue("");
  }, [inputValue, isLoading, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ 
        y: "50vh", 
        scale: 0.8,
        opacity: 0 
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1] // cubic-bezier(0.4, 0, 0.2, 1)
      }}
      className="flex items-center justify-center min-h-screen p-4 bg-black"
    >
      <div className="w-full max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">CA</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Christian Apologetics Assistant</h2>
          <p className="text-gray-400">Ask me anything about defending the Christian faith</p>
        </motion.div>
        
        {/* Example Questions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
        >
          {exampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputValue(question)}
              className="p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 text-sm text-white"
            >
              {question}
            </button>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex gap-2"
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none border border-gray-700 rounded-2xl px-4 py-3 bg-gray-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{ 
              resize: 'none',
              overflow: 'hidden',
              lineHeight: '1.5'
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Full Chat Interface Component (After first message)
const FullChatInterface = ({ 
  messages, 
  onSendMessage, 
  placeholder, 
  title, 
  isLoading, 
  isTyping, 
  onCopyMessage, 
  onFeedback, 
  formatTime 
}: {
  messages: Message[];
  onSendMessage: (message: string) => void;
  placeholder: string;
  title: string;
  isLoading: boolean;
  isTyping: boolean;
  onCopyMessage: (content: string) => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  formatTime: (date: Date) => string;
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  }, [inputValue, isLoading, onSendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
        staggerChildren: 0.1 
      }}
      className="flex flex-col h-full bg-black text-white"
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-black mt-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">CA</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">ChristTask</h2>
            <p className="text-sm text-gray-400">Debate ready?</p>
          </div>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-800 text-white'
              }`}>
                {message.sender === 'user' ? 'U' : 'CA'}
              </div>
              
              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                CA
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">Typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 border-t border-gray-800 p-4 bg-black">
        {/* Example Questions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {exampleQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => setInputValue(question)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200 text-white"
            >
              {question}
            </button>
          ))}
        </div>
        
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading}
              style={{
                resize: 'none',
                overflow: 'hidden'
              }}
            />
            <button
              onClick={() => {
                if (inputValue.trim() && !isLoading) {
                  onSendMessage(inputValue.trim());
                  setInputValue("");
                }
              }}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 bottom-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Chatbot Component
export const AIChatbot = ({
  onSendMessage,
  className = "",
  placeholder = "Message AI Assistant...",
  title = "AI Assistant",
  aiName = "AI",
  userAvatar,
  aiAvatar,
}: AIChatbotProps) => {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Handle first message and start chat
  const handleFirstMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      let aiResponse = "";
      
      if (onSendMessage) {
        aiResponse = await onSendMessage(message);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiResponse = "This is a demo response. In a real implementation, you would integrate with your AI API here.";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([userMessage, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Trigger expansion animation after a short delay
      setTimeout(() => {
        setHasStartedChat(true);
      }, 100);
    }
  }, [onSendMessage]);

  // Handle subsequent messages
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      let aiResponse = "";
      
      if (onSendMessage) {
        aiResponse = await onSendMessage(message);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiResponse = "This is a demo response. In a real implementation, you would integrate with your AI API here.";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [isLoading, onSendMessage]);

  // Copy message to clipboard
  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  }, []);

  // Handle message feedback
  const handleFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback } 
          : msg
      )
    );
  }, []);

  // Format timestamp
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div className={cn("h-full", className)}>
      <AnimatePresence mode="wait">
        {!hasStartedChat ? (
          <InitialInputBox 
            key="initial"
            onSend={handleFirstMessage}
            placeholder={placeholder}
            isLoading={isLoading}
          />
        ) : (
          <FullChatInterface
            key="expanded"
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder={placeholder}
            title={title}
            isLoading={isLoading}
            isTyping={isTyping}
            onCopyMessage={handleCopyMessage}
            onFeedback={handleFeedback}
            formatTime={formatTime}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 