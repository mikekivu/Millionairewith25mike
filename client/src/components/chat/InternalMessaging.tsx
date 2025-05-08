import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Send, Search, MoreVertical, Check, CheckCheck } from 'lucide-react';

interface User {
  id: number;
  name: string;
  avatar?: string;
  role: 'admin' | 'member';
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: number;
  userId: number;
  lastMessageId: number;
  lastMessageTime: Date;
  unreadCount: number;
}

interface InternalMessagingProps {
  currentUserId: number;
  isAdmin?: boolean;
}

const InternalMessaging: React.FC<InternalMessagingProps> = ({ currentUserId, isAdmin = false }) => {
  // Mock users data
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Admin', role: 'admin', status: 'online' },
    { id: 2, name: 'John Smith', role: 'member', status: 'online', lastSeen: new Date() },
    { id: 3, name: 'Sarah Johnson', role: 'member', status: 'offline', lastSeen: new Date(Date.now() - 3600000) },
    { id: 4, name: 'Michael Brown', role: 'member', status: 'away', lastSeen: new Date(Date.now() - 1800000) },
    { id: 5, name: 'Emma Wilson', role: 'member', status: 'online', lastSeen: new Date() },
  ]);

  // Mock conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, userId: 2, lastMessageId: 4, lastMessageTime: new Date(), unreadCount: 2 },
    { id: 2, userId: 3, lastMessageId: 5, lastMessageTime: new Date(Date.now() - 86400000), unreadCount: 0 },
    { id: 3, userId: 4, lastMessageId: 7, lastMessageTime: new Date(Date.now() - 172800000), unreadCount: 0 },
    { id: 4, userId: 5, lastMessageId: 8, lastMessageTime: new Date(Date.now() - 259200000), unreadCount: 0 },
  ]);

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([
    // Conversation with John Smith
    { id: 1, senderId: 2, receiverId: 1, content: "Hello, I'm interested in the Gold plan. Can you tell me more about it?", timestamp: new Date(Date.now() - 3600000), read: true },
    { id: 2, senderId: 1, receiverId: 2, content: "Hi John! The Gold plan has a minimum deposit of $500 with a 15% ROI monthly. It also comes with special rewards after 3 months of consistent investment.", timestamp: new Date(Date.now() - 3500000), read: true },
    { id: 3, senderId: 2, receiverId: 1, content: "That sounds great! How do I upgrade to this plan?", timestamp: new Date(Date.now() - 3400000), read: true },
    { id: 4, senderId: 1, receiverId: 2, content: "You can upgrade from your dashboard. Go to Plans section and select the Gold plan. Let me know if you need any help with the process.", timestamp: new Date(Date.now() - 3300000), read: false },
    
    // Conversation with Sarah Johnson
    { id: 5, senderId: 3, receiverId: 1, content: "I'm having trouble with my withdrawal request. Can you help?", timestamp: new Date(Date.now() - 86400000), read: true },
    
    // Conversation with Michael Brown
    { id: 6, senderId: 1, receiverId: 4, content: "Michael, your referral bonus has been credited to your account!", timestamp: new Date(Date.now() - 172900000), read: true },
    { id: 7, senderId: 4, receiverId: 1, content: "Thank you! I'll check it out.", timestamp: new Date(Date.now() - 172800000), read: true },
    
    // Conversation with Emma Wilson
    { id: 8, senderId: 5, receiverId: 1, content: "When will the new tablet rewards be available?", timestamp: new Date(Date.now() - 259200000), read: true },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentChat, setCurrentChat] = useState<number | null>(isAdmin ? 2 : 1); // Default to first conversation
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentChat]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (currentChat) {
      const userId = isAdmin ? currentChat : 1;
      const updatedMessages = messages.map(msg => 
        msg.senderId === userId && msg.receiverId === currentUserId && !msg.read
          ? { ...msg, read: true }
          : msg
      );
      
      setMessages(updatedMessages);
      
      // Update unread count in conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === userId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  }, [currentChat, currentUserId, isAdmin, messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChat) return;
    
    const newMessageObj: Message = {
      id: messages.length + 1,
      senderId: currentUserId,
      receiverId: isAdmin ? currentChat : 1, // If admin, send to selected user, else send to admin
      content: newMessage,
      timestamp: new Date(),
      read: false
    };
    
    setMessages(prev => [...prev, newMessageObj]);
    setNewMessage('');
    
    // Simulate response after 2 seconds
    if (!isAdmin) {
      setTimeout(() => {
        const responseMessage: Message = {
          id: messages.length + 2,
          senderId: 1, // Admin
          receiverId: currentUserId,
          content: "Thank you for your message. An admin will get back to you shortly.",
          timestamp: new Date(),
          read: false
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date?: Date): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusLabel = (user: User) => {
    if (user.status === 'online') return 'Online';
    if (user.status === 'away') return 'Away';
    return `Last seen ${formatLastSeen(user.lastSeen)}`;
  };

  const filteredUsers = users.filter(user => {
    // Don't show current user in the list
    if (user.id === currentUserId) return false;
    
    // If not admin, only show admin in the list
    if (!isAdmin && user.role !== 'admin') return false;
    
    // If admin, don't show other admins
    if (isAdmin && user.role === 'admin' && user.id !== currentUserId) return false;
    
    // Filter by search term
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const sortedConversations = [...conversations].sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

  const currentMessages = messages.filter(msg => 
    (msg.senderId === currentUserId && msg.receiverId === (isAdmin ? currentChat : 1)) || 
    (msg.receiverId === currentUserId && msg.senderId === (isAdmin ? currentChat : 1))
  );

  const getCurrentChatUser = () => {
    return users.find(user => user.id === (isAdmin ? currentChat : 1));
  };

  return (
    <div className="flex h-[600px] overflow-hidden border rounded-lg bg-white">
      {/* Left sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sortedConversations
            .filter(conv => {
              const user = users.find(u => u.id === conv.userId);
              return filteredUsers.some(fu => fu.id === conv.userId);
            })
            .map(conv => {
              const user = users.find(u => u.id === conv.userId);
              const lastMessage = messages.find(msg => msg.id === conv.lastMessageId);
              
              if (!user || !lastMessage) return null;
              
              return (
                <div 
                  key={conv.id}
                  onClick={() => setCurrentChat(user.id)}
                  className={cn(
                    "flex items-center p-3 cursor-pointer border-b",
                    currentChat === user.id ? "bg-orange-50" : "hover:bg-gray-50"
                  )}
                >
                  <div className="relative mr-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-800">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span 
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                        user.status === "online" ? "bg-green-500" : 
                        user.status === "away" ? "bg-yellow-500" : "bg-gray-400"
                      )}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-medium truncate">{user.name}</h4>
                      <span className="text-xs text-gray-500">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Right chat area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={getCurrentChatUser()?.avatar} />
                  <AvatarFallback className="bg-orange-100 text-orange-800">
                    {getCurrentChatUser()?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{getCurrentChatUser()?.name}</h3>
                  <p className="text-xs text-gray-500">
                    {getCurrentChatUser() ? getStatusLabel(getCurrentChatUser()!) : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex",
                      msg.senderId === currentUserId ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.senderId !== currentUserId && (
                      <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                        <AvatarImage src={users.find(u => u.id === msg.senderId)?.avatar} />
                        <AvatarFallback className="bg-orange-100 text-orange-800">
                          {users.find(u => u.id === msg.senderId)?.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "max-w-[75%] rounded-lg px-4 py-2",
                      msg.senderId === currentUserId 
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-tr-none" 
                        : "bg-white border shadow-sm rounded-tl-none"
                    )}>
                      <p>{msg.content}</p>
                      <div className={cn(
                        "text-right text-xs mt-1 flex items-center justify-end",
                        msg.senderId === currentUserId ? "text-orange-100" : "text-gray-400"
                      )}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.senderId === currentUserId && (
                          <span className="ml-1">
                            {msg.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">No conversation selected</h3>
                  <p className="text-gray-500 mt-2">
                    Select a conversation from the sidebar to start messaging or search for a specific user.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalMessaging;