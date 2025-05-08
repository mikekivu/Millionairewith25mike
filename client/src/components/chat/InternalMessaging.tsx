import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical, 
  ChevronDown, 
  User, 
  Clock, 
  CheckCheck, 
  Plus,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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

// Sample data
const sampleUsers: User[] = [
  { id: 1, name: 'Admin User', role: 'admin', status: 'online' },
  { id: 2, name: 'John Smith', role: 'member', status: 'online' },
  { id: 3, name: 'Sarah Johnson', role: 'member', status: 'offline', lastSeen: new Date(Date.now() - 25 * 60 * 1000) },
  { id: 4, name: 'Michael Brown', role: 'member', status: 'away' },
  { id: 5, name: 'Emma Wilson', role: 'member', status: 'online' },
  { id: 6, name: 'James Taylor', role: 'member', status: 'offline', lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 7, name: 'Jessica Adams', role: 'member', status: 'offline', lastSeen: new Date(Date.now() - 48 * 60 * 60 * 1000) },
];

const sampleConversations: Conversation[] = [
  { id: 1, userId: 2, lastMessageId: 1, lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), unreadCount: 0 },
  { id: 2, userId: 3, lastMessageId: 3, lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000), unreadCount: 2 },
  { id: 3, userId: 5, lastMessageId: 5, lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000), unreadCount: 0 },
];

const sampleMessages: Record<number, Message[]> = {
  1: [
    { id: 1, senderId: 2, receiverId: 1, content: "Hello, I have a question about my investment plan.", timestamp: new Date(Date.now() - 10 * 60 * 1000), read: true },
    { id: 2, senderId: 1, receiverId: 2, content: "Hi John, I'd be happy to help. What's your question?", timestamp: new Date(Date.now() - 5 * 60 * 1000), read: true },
  ],
  2: [
    { id: 3, senderId: 3, receiverId: 1, content: "When will my withdrawal be processed?", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), read: false },
    { id: 4, senderId: 3, receiverId: 1, content: "It's been pending for 2 days now.", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1000), read: false },
  ],
  3: [
    { id: 5, senderId: 1, receiverId: 5, content: "Congratulations on reaching Gold level status! You've now unlocked additional benefits.", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), read: true },
  ],
};

interface InternalMessagingProps {
  currentUserId: number;
  isAdmin?: boolean;
}

const InternalMessaging: React.FC<InternalMessagingProps> = ({ 
  currentUserId = 1, 
  isAdmin = true 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [messages, setMessages] = useState<Record<number, Message[]>>(sampleMessages);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newMessageText, setNewMessageText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const filteredConversations = conversations
    .filter(conversation => {
      const user = users.find(u => u.id === conversation.userId);
      return user && user.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

  useEffect(() => {
    if (activeConversation) {
      scrollToBottom();
      
      // Mark messages as read
      const updatedMessages = { ...messages };
      if (updatedMessages[activeConversation]) {
        updatedMessages[activeConversation] = updatedMessages[activeConversation].map(msg => {
          if (msg.receiverId === currentUserId && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        });
      }
      
      // Update unread count
      setConversations(convs => 
        convs.map(conv => 
          conv.id === activeConversation ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      setMessages(updatedMessages);
    }
  }, [activeConversation, currentUserId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversation) return;
    
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;
    
    const recipient = users.find(u => u.id === conversation.userId);
    if (!recipient) return;
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: currentUserId,
      receiverId: recipient.id,
      content: messageText.trim(),
      timestamp: new Date(),
      read: false
    };
    
    // Update messages
    const updatedMessages = { ...messages };
    if (!updatedMessages[activeConversation]) {
      updatedMessages[activeConversation] = [];
    }
    updatedMessages[activeConversation] = [...updatedMessages[activeConversation], newMessage];
    setMessages(updatedMessages);
    
    // Update conversation last message
    setConversations(convs => 
      convs.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              lastMessageId: newMessage.id, 
              lastMessageTime: newMessage.timestamp 
            } 
          : conv
      )
    );
    
    setMessageText('');
    
    // In a real app, send the message to the server
    // For demo, simulate successful send
    toast({
      title: "Message sent",
      description: "Your message has been delivered successfully.",
    });
  };

  const handleStartNewConversation = () => {
    if (!selectedUser || !newMessageText.trim()) return;
    
    const recipientId = parseInt(selectedUser);
    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) return;
    
    // Check if conversation already exists
    let conversationId = conversations.find(c => c.userId === recipientId)?.id;
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: currentUserId,
      receiverId: recipientId,
      content: newMessageText.trim(),
      timestamp: new Date(),
      read: false
    };
    
    if (conversationId) {
      // Update existing conversation
      const updatedMessages = { ...messages };
      updatedMessages[conversationId] = [...(updatedMessages[conversationId] || []), newMessage];
      setMessages(updatedMessages);
      
      setConversations(convs => 
        convs.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                lastMessageId: newMessage.id, 
                lastMessageTime: newMessage.timestamp 
              } 
            : conv
        )
      );
    } else {
      // Create new conversation
      conversationId = Date.now();
      const newConversation: Conversation = {
        id: conversationId,
        userId: recipientId,
        lastMessageId: newMessage.id,
        lastMessageTime: newMessage.timestamp,
        unreadCount: 0
      };
      
      setConversations([...conversations, newConversation]);
      
      const updatedMessages = { ...messages };
      updatedMessages[conversationId] = [newMessage];
      setMessages(updatedMessages);
    }
    
    // Reset form and close dialog
    setNewMessageText('');
    setSelectedUser('');
    setNewMessageDialogOpen(false);
    
    // Set active conversation to the new or updated one
    setActiveConversation(conversationId);
    
    toast({
      title: "Conversation started",
      description: `You've started a new conversation with ${recipient.name}.`,
    });
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 48 * 60 * 60 * 1000) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatLastSeen = (date?: Date): string => {
    if (!date) return 'a while ago';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) {
      return 'just now';
    } else if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'away':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'offline':
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusLabel = (user: User) => {
    switch (user.status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return `Last seen ${formatLastSeen(user.lastSeen)}`;
    }
  };

  const activeUser = activeConversation 
    ? users.find(u => u.id === conversations.find(c => c.id === activeConversation)?.userId) 
    : null;

  return (
    <div className="flex h-[700px] border rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-full max-w-xs border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            <Dialog open={newMessageDialogOpen} onOpenChange={setNewMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>
                    Start a new conversation with a team member.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="recipient" className="text-sm font-medium">
                      Recipient
                    </label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter(user => user.id !== currentUserId)
                          .map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              <div className="flex items-center">
                                {user.name}
                                <span className="ml-2 flex items-center">
                                  {getStatusIcon(user.status)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      value={newMessageText}
                      onChange={e => setNewMessageText(e.target.value)}
                      placeholder="Type your message..."
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewMessageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStartNewConversation}>
                    Send
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(700px-73px)]">
          {filteredConversations.length > 0 ? (
            <div className="divide-y">
              {filteredConversations.map(conversation => {
                const user = users.find(u => u.id === conversation.userId);
                if (!user) return null;
                
                const lastMessage = messages[conversation.id]?.slice(-1)[0];
                
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors ${
                      activeConversation === conversation.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-yellow-200 text-yellow-800">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 ring-2 ring-white rounded-full">
                          {getStatusIcon(user.status)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-gray-500 truncate">
                            {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="mt-1 flex justify-end">
                        <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
                          {conversation.unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No conversations found</p>
              {searchTerm && (
                <Button 
                  variant="link" 
                  className="mt-2 text-yellow-600"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation && activeUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
                  <AvatarFallback className="bg-yellow-200 text-yellow-800">
                    {activeUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{activeUser.name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="flex items-center mr-1">
                      {getStatusIcon(activeUser.status)}
                    </span>
                    <span>{getStatusLabel(activeUser)}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Conversation Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Mark as Unread
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages[activeConversation]?.map(message => {
                  const isCurrentUser = message.senderId === currentUserId;
                  const sender = users.find(u => u.id === message.senderId);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src={sender?.avatar} alt={sender?.name} />
                          <AvatarFallback className="bg-yellow-200 text-yellow-800">
                            {sender?.name.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 text-xs ${
                          isCurrentUser ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {isCurrentUser && (
                            <CheckCheck className={`ml-1 h-3 w-3 ${
                              message.read ? 'text-white' : 'text-white/60'
                            }`} />
                          )}
                        </div>
                      </div>
                      
                      {isCurrentUser && (
                        <Avatar className="h-8 w-8 ml-2 mt-1">
                          <AvatarImage src={sender?.avatar} alt={sender?.name} />
                          <AvatarFallback className="bg-orange-200 text-orange-800">
                            {sender?.name.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <Textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-12 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button 
                  type="submit"
                  size="icon"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Select a conversation from the list or start a new conversation to send messages.
            </p>
            <Button onClick={() => setNewMessageDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalMessaging;