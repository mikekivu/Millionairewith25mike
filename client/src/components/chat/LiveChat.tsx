import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
};

interface LiveChatProps {
  userId?: number;
  userName?: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can we help you today?',
      sender: 'agent',
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: getAutoResponse(message),
        sender: 'agent',
        timestamp: new Date(),
        status: 'delivered'
      };
      
      setMessages(prev => [...prev, responseMsg]);
      setIsTyping(false);
      
      if (!isOpen) {
        toast({
          title: "New message from support",
          description: "You have a new message from our support team."
        });
      }
    }, 1500);
  };

  // Auto-response based on message content
  const getAutoResponse = (msg: string): string => {
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return "Hello! How can I assist you today with your investment journey?";
    } else if (lowerMsg.includes('plan') || lowerMsg.includes('invest')) {
      return "We offer several investment plans with different ROI rates. Would you like me to explain our options?";
    } else if (lowerMsg.includes('withdraw') || lowerMsg.includes('payment')) {
      return "Withdrawals are processed within 24-48 hours. Is there anything specific about the withdrawal process you'd like to know?";
    } else if (lowerMsg.includes('referral') || lowerMsg.includes('commission')) {
      return "Our referral program offers commissions up to 5 levels deep. Would you like more details about our commission structure?";
    } else {
      return "Thank you for your message. Our support team will review it and get back to you shortly. Is there anything else I can help you with?";
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleChat}
                    className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    <MessageSquare className="h-6 w-6 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Chat with us</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-lg overflow-hidden shadow-xl bg-white border border-gray-200"
          >
            {/* Chat header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 border-2 border-white">
                  <AvatarImage src="/agent-avatar.png" alt="Support Agent" />
                  <AvatarFallback className="bg-yellow-200 text-yellow-800">SA</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-medium text-sm">Live Support</h3>
                  <p className="text-white/80 text-xs">We typically reply in a few minutes</p>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 text-white hover:bg-white/20">
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-white hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Chat body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 h-80 overflow-y-auto bg-gray-50">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'agent' && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarImage src="/agent-avatar.png" alt="Support Agent" />
                            <AvatarFallback className="bg-yellow-200 text-yellow-800">SA</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                              : 'bg-white shadow-sm border border-gray-100'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {msg.sender === 'user' && (
                          <Avatar className="h-8 w-8 ml-2 mt-1">
                            <AvatarImage src="/user-avatar.png" alt="You" />
                            <AvatarFallback className="bg-orange-200 text-orange-800">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center mb-4">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/agent-avatar.png" alt="Support Agent" />
                          <AvatarFallback className="bg-yellow-200 text-yellow-800">SA</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                    <div className="flex items-end">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-12 resize-none pr-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Our team is available 24/7 to assist you
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;