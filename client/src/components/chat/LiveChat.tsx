import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'user' | 'admin' | 'system';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface LiveChatProps {
  userId?: number;
  userName?: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ userId = 0, userName = 'Guest' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'system',
      content: 'Welcome to MillionareWith$25 live support! How can we help you today?',
      timestamp: new Date(),
      read: true
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate admin response
  const simulateAdminResponse = (userMessage: string) => {
    // Show typing indicator
    setIsAdminTyping(true);
    
    // Simulate a delay for admin response
    setTimeout(() => {
      setIsAdminTyping(false);
      
      // Generate a context-aware response based on user's message
      let response = '';
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        response = `Hello there! How can I assist you with your MillionareWith$25 account today?`;
      } 
      else if (lowerMsg.includes('plan') || lowerMsg.includes('investment')) {
        response = `We offer several investment plans starting from as low as $25. Each plan has different ROI rates and durations. You can check the details in the Plans section.`;
      }
      else if (lowerMsg.includes('withdraw') || lowerMsg.includes('payment')) {
        response = `Withdrawals are processed within 24 hours. The minimum withdrawal amount is $10. You can request a withdrawal from your dashboard.`;
      }
      else if (lowerMsg.includes('referral') || lowerMsg.includes('commission')) {
        response = `Our referral program offers up to 5 levels of commission: 10% for level 1, 5% for level 2, 3% for level 3, 2% for level 4, and 1% for level 5.`;
      }
      else if (lowerMsg.includes('contact') || lowerMsg.includes('support')) {
        response = `You can contact our support team at info@millionairewith25.com or through this live chat. We're available 24/7 to assist you.`;
      }
      else {
        response = `Thank you for your message. Our team will get back to you shortly. If you have any specific questions about our investment plans or your account, please let us know.`;
      }
      
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'admin',
        content: response,
        timestamp: new Date(),
        read: isOpen
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1500);
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date(),
      read: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate admin response
    simulateAdminResponse(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (unreadCount > 0 && !isOpen) {
      setUnreadCount(0);
      setMessages(prev => 
        prev.map(msg => ({...msg, read: true}))
      );
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button */}
      <button 
        onClick={toggleChat}
        className={cn(
          "fixed z-50 flex items-center justify-center bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl",
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs">
                {unreadCount}
              </Badge>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed z-40 bottom-4 right-4 w-full max-w-sm mb-16 shadow-xl border-t-4 border-t-orange-500 animate-in slide-in-from-bottom duration-300">
          <CardHeader className={cn(
            "bg-gradient-to-r from-orange-50 to-yellow-50 py-3 flex flex-row items-center justify-between cursor-pointer border-b", 
            isMinimized && "rounded-b-lg"
          )} onClick={toggleMinimize}>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/assets/support-avatar.png" alt="Support" />
                <AvatarFallback className="bg-orange-100 text-orange-800">
                  CS
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-medium flex items-center">
                Live Support
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-100">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Online
                </Badge>
              </CardTitle>
            </div>
            {isMinimized ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </CardHeader>
          
          {!isMinimized && (
            <>
              <CardContent className="h-96 overflow-y-auto p-4 bg-stone-50">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex",
                        msg.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender === 'admin' && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarImage src="/assets/support-avatar.png" alt="Support" />
                          <AvatarFallback className="bg-orange-100 text-orange-800">CS</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 break-words",
                        msg.sender === 'user' 
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-tr-none" 
                          : msg.sender === 'admin'
                            ? "bg-white border shadow-sm rounded-tl-none" 
                            : "bg-gray-100 w-full text-center text-sm py-1"
                      )}>
                        {msg.sender !== 'system' && (
                          <div className={cn(
                            "text-xs mb-1",
                            msg.sender === 'user' ? "text-yellow-100" : "text-gray-500"
                          )}>
                            {msg.sender === 'user' ? userName : 'Support Agent'}
                          </div>
                        )}
                        <p>{msg.content}</p>
                        <div className={cn(
                          "text-right text-xs mt-1",
                          msg.sender === 'user' ? "text-yellow-100" : "text-gray-400"
                        )}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isAdminTyping && (
                    <div className="flex justify-start">
                      <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                        <AvatarImage src="/assets/support-avatar.png" alt="Support" />
                        <AvatarFallback className="bg-orange-100 text-orange-800">CS</AvatarFallback>
                      </Avatar>
                      <div className="bg-white border shadow-sm rounded-lg rounded-tl-none p-3">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-3 border-t bg-white">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default LiveChat;