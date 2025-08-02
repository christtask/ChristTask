import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessageUsage } from '@/hooks/useMessageUsage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  topic?: string;
}

interface ChatInterfaceProps {
  selectedTopic?: string | null;
}

export const ChatInterface = ({ selectedTopic }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeTab, setActiveTab] = useState('chatbot');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useAuth();
  const { remainingMessages, loading: usageLoading, refreshUsage } = useMessageUsage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fallback minimal chat UI state
  const [fallbackMessages, setFallbackMessages] = useState([]);
  const [fallbackInput, setFallbackInput] = useState("");

  // Helper function to get chat title based on type
  const getChatTitle = (topic: string | null) => {
    if (!topic) return 'AI Assistant';
    
    const chatTitles: Record<string, string> = {
      'atheists': 'Answering Atheists',
      'muslim': 'Muslim Arguments',
      'faith': 'Faith Builder',
      'study': 'Bible Study Assistant',
      'counseling': 'Spiritual Counselor',
      'evangelism': 'Evangelism Coach',
      'apologetics': 'Apologetics Expert',
      'prayer': 'Prayer Partner'
    };
    
    return chatTitles[topic] || `${topic} Assistant`;
  };

  // Always render HamburgerMenu, even for guests
  const fallbackChat = (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Chatbot</h2>
      <div style={{ minHeight: 200, marginBottom: 16, background: "#f7f7f7", borderRadius: 8, padding: 12 }}>
        {fallbackMessages.length === 0 && <div style={{ color: "#888" }}>Say hello to the chatbot!</div>}
        {fallbackMessages.map((msg, i) => (
          <div key={i} style={{ margin: "8px 0", padding: 8, background: i % 2 === 0 ? "#e3f2fd" : "#fffde7", borderRadius: 6 }}>{msg}</div>
        ))}
      </div>
      <input
        value={fallbackInput}
        onChange={e => setFallbackInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && fallbackInput.trim()) { setFallbackMessages([...fallbackMessages, fallbackInput]); setFallbackInput(""); }}}
        placeholder="Type your message..."
        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 8 }}
      />
      <button
        onClick={() => { if (fallbackInput.trim()) { setFallbackMessages([...fallbackMessages, fallbackInput]); setFallbackInput(""); }}}
        style={{ width: "100%", padding: 10, borderRadius: 6, background: "#1976d2", color: "#fff", fontWeight: 600, border: "none" }}
      >Send</button>
    </div>
  );

  // Generate conversation ID for this session
  useEffect(() => {
    if (!conversationId) {
      setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    // Add welcome message when topic is selected or when starting direct chat
    if (selectedTopic) {
      const welcomeMessages: Record<string, string> = {
        'atheists': "Hello! I'm your Atheist Response Specialist. I'm here to help you master responses to common atheist objections and strengthen your faith with evidence-based answers. Ask me about scientific objections, moral arguments, logical fallacies, or any atheist challenge you've encountered.",
        'muslim': "Hello! I'm your Muslim Engagement Specialist. I'm here to help you respectfully engage with Muslim arguments and share the Gospel effectively. I can help with Quranic challenges, prophet comparisons, Trinity explanations, and cultural sensitivity in Muslim-Christian dialogue.",
        'faith': "Hello! I'm your Faith Builder. I'm here to help you build a stronger foundation for your faith with deep theological insights and personal growth. Whether you're facing doubts, seeking deeper understanding, or want to grow spiritually, I'm here to support your journey.",
        'study': "Hello! I'm your Bible Study Assistant. I'm here to help you dive deep into Scripture with contextual explanations, cross-references, and original language insights. Ask me about any verse, passage, or biblical topic for detailed analysis.",
        'counseling': "Hello! I'm your Spiritual Counselor. I'm here to provide biblical wisdom and guidance for life challenges, relationships, and personal struggles. I'll offer prayerful support and scriptural insights to help you navigate difficult situations.",
        'evangelism': "Hello! I'm your Evangelism Coach. I'm here to help you learn proven methods to share the Gospel with different audiences and handle objections effectively. I can help you craft personal testimonies and present the Gospel with cultural sensitivity.",
        'apologetics': "Hello! I'm your Apologetics Expert. I'm here to help you master the intellectual defense of Christianity with philosophical arguments, scientific evidence, historical proofs, and logical reasoning to support your faith.",
        'prayer': "Hello! I'm your Prayer Partner. I'm here to help you develop a deeper prayer routine with guided experiences, scripture meditation, and spiritual practices. I can help you connect more intimately with God through prayer."
      };
      
      const welcomeMessage: Message = {
        id: 'welcome',
        content: welcomeMessages[selectedTopic] || `Hello! I'm ready to help you with questions about ${selectedTopic}. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date(),
        topic: selectedTopic
      };
      setMessages([welcomeMessage]);
    } else {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hello! I'm your AI Assistant. I'm here to help you with various aspects of your Christian life and faith journey. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedTopic]);

  const handleSendMessage = async () => {
    logger.info('handleSendMessage called with inputMessage:', inputMessage);
    logger.info('Current state - isLoading:', isLoading, 'user:', !!user, 'remainingMessages:', remainingMessages);
    
    if (!inputMessage.trim() || isLoading || !user) {
      logger.info('Early return - inputMessage:', inputMessage.trim(), 'isLoading:', isLoading, 'user:', !!user);
      return;
    }
    
    if (remainingMessages <= 0) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used all 15 messages for today. Try again tomorrow!",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      topic: selectedTopic || undefined
    };

    logger.info('Sending user message:', inputMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      logger.info('Calling Supabase function with:', {
        message: inputMessage,
        topic: selectedTopic,
        conversationId: conversationId
      });

      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: {
          message: inputMessage,
          topic: selectedTopic,
          conversationId: conversationId
        },
      });

      logger.info('Supabase function response:', { data, error });

      if (error) {
        logger.error('Supabase function error:', error);
        if (error.message && error.message.includes('Daily message limit reached')) {
          toast({
            title: "Daily Limit Reached",
            description: "You've reached your daily message limit.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      logger.info('Bot response data:', data);
      logger.info('Bot response content:', data?.response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
        topic: selectedTopic || undefined
      };

      logger.info('Adding bot message:', botMessage);
      setMessages(prev => [...prev, botMessage]);
      
      // Refresh usage count
      refreshUsage();

      toast({
        title: "Message sent",
        description: `${data.remaining} messages remaining today`,
      });

    } catch (error) {
      logger.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    
    toast({
      title: "Feedback recorded",
      description: "Thank you for your feedback!",
    });
  };

  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `christtask-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Conversation exported",
      description: "Your conversation has been downloaded.",
    });
  };

  const shareConversation = async () => {
    const conversationText = messages
      .map(msg => `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ChristTask Conversation',
          text: conversationText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(conversationText);
      toast({
        title: "Conversation copied",
        description: "Conversation copied to clipboard!",
      });
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your message now.",
        });
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again or type your message.",
          variant: "destructive",
        });
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
    }
  };

  if (usageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#18181b] w-full min-h-screen">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-[#18181b] mt-12">
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

      {/* Scrollable Chat messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">Start a conversation with Debate AI Chat!</div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow text-base whitespace-pre-wrap break-words ${
                message.sender === 'user'
                  ? 'bg-green-600 text-white rounded-br-md'
                  : 'bg-[#232323] text-gray-100 rounded-bl-md'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Fixed Input area at the bottom */}
      <div className="flex-shrink-0 w-full bg-[#232323] p-6 border-t border-gray-800">
        <div className="w-full max-w-4xl mx-auto">
          <form
            onSubmit={e => { 
              e.preventDefault(); 
              logger.info('Form submitted, calling handleSendMessage');
              handleSendMessage(); 
            }}
            className="relative"
          >
            <Input
              ref={textareaRef}
              id="chat-input"
              name="chat-input"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  logger.info('Enter key pressed, calling handleSendMessage');
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full resize-none rounded-2xl bg-[#18181b] text-white border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-600/30 shadow-sm px-4 py-3 min-h-[52px] max-h-[200px] transition-all duration-200"
              style={{ 
                resize: 'none',
                overflow: 'hidden'
              }}
              rows={1}
              autoFocus
            />
            <Button
              type="submit"
              className="absolute right-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl shadow font-semibold transition-all duration-200"
              disabled={isLoading || !inputMessage.trim()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
