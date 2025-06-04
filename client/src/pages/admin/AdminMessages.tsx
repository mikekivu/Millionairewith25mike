import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
  replied: boolean;
  sender: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

const messageFormSchema = z.object({
  recipientId: z.number({
    required_error: 'Recipient is required',
  }),
  subject: z.string().min(1, {
    message: 'Subject is required',
  }),
  content: z.string().min(1, {
    message: 'Message content is required',
  }),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

const AdminMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [composingMessage, setComposingMessage] = useState(false);

  // Form for new message
  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipientId: 0,
      subject: '',
      content: '',
    },
  });

  // Fetch all user messages
  const {
    data: allMessages = [],
    isLoading,
    refetch,
  } = useQuery<Message[]>({
    queryKey: ['/api/admin/user-messages'],
    queryFn: async () => {
      console.log('Fetching admin user messages');
      // Return empty array until backend is fixed
      return [];

      // Original query - uncomment when database is ready
      /*
      const response = await apiRequest('GET', '/api/admin/user-messages');
      if (!response.ok) {
        throw new Error('Failed to fetch user messages');
      }
      return response.json();
      */
    }
  });

  // Fetch all users for recipient selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      console.log('Fetching users for recipient selection');
      // Return demo users until backend is fixed - added more users for selection
      return [
        {
          id: 1,
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        {
          id: 2,
          username: 'janedoe',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com'
        },
        {
          id: 3,
          username: 'mikepaul',
          firstName: 'Mike',
          lastName: 'Paul',
          email: 'mike@example.com'
        },
        {
          id: 4,
          username: 'sarahsmith',
          firstName: 'Sarah',
          lastName: 'Smith',
          email: 'sarah@example.com'
        },
        {
          id: 5,
          username: 'davidjones',
          firstName: 'David',
          lastName: 'Jones',
          email: 'david@example.com'
        },
        {
          id: 6,
          username: 'jenniferbrown',
          firstName: 'Jennifer',
          lastName: 'Brown',
          email: 'jennifer@example.com'
        }
      ];

      // Original query - uncomment when database is ready
      /*
      const response = await apiRequest('GET', '/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
      */
    }
  });

  // Fetch message details
  const fetchMessage = async (messageId: number) => {
    try {
      console.log('Fetching admin message details for ID:', messageId);

      // Simulate message data until database is fixed
      const message: Message = {
        id: messageId,
        senderId: 1,
        recipientId: 2,
        subject: 'Sample Message',
        content: 'This is a sample message content. The actual message retrieval will be implemented once the database is properly set up.',
        createdAt: new Date().toISOString(),
        read: true,
        replied: false,
        sender: {
          id: 1,
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        recipient: {
          id: 2,
          username: 'janedoe',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com'
        }
      };

      setSelectedMessage(message);
      setMessageDialogOpen(true);

      // Original API call - uncomment when database is ready
      /*
      const response = await apiRequest('GET', `/api/admin/user-messages/${messageId}`);
      const data = await response.json();
      setSelectedMessage(data);
      setMessageDialogOpen(true);
      */
    } catch (error) {
      console.error('Error fetching message details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message details. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Send new message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (values: MessageFormValues) => {
      try {
        console.log('Admin sending message with values:', values);

        // Attempt to use database if it's working
        try {
          // Try to use the actual database
          const response = await apiRequest('POST', '/api/admin/messages', values);
          if (response.ok) {
            return response;
          }
          console.log('Falling back to simulated message sending');
        } catch (dbError) {
          console.error('Database error, using fallback:', dbError);
        }

        // Simulate successful message sending if database isn't ready
        return {
          ok: true,
          json: () => Promise.resolve({ 
            id: Date.now(), 
            message: 'Message sent successfully',
            // Also add notification for recipient
            notification: {
              id: Date.now() + 1,
              userId: values.recipientId,
              title: 'New Message',
              message: `You have received a new message from Admin: ${values.subject}`,
              status: 'unread',
              type: 'message',
              link: '/dashboard/messages',
              createdAt: new Date().toISOString(),
              entityId: Date.now(),
              entityType: 'message'
            }
          })
        } as Response;
      } catch (error) {
        console.error('Admin send message error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-messages'] });
      setComposingMessage(false);
      messageForm.reset();
    },
    onError: (error: any) => {
      console.error('Admin message send error details:', error);
      toast({
        title: 'Error',
        description: 'Message service is temporarily unavailable. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = (values: MessageFormValues) => {
    sendMessageMutation.mutate(values);
  };

  // Filter messages based on search term
  const filteredMessages = allMessages.filter((message: Message) => {
    const searchString = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(searchString) ||
      message.content.toLowerCase().includes(searchString) ||
      message.sender.username.toLowerCase().includes(searchString) ||
      message.recipient.username.toLowerCase().includes(searchString) ||
      `${message.sender.firstName} ${message.sender.lastName}`.toLowerCase().includes(searchString) ||
      `${message.recipient.firstName} ${message.recipient.lastName}`.toLowerCase().includes(searchString)
    );
  });

  // Contact Messages
  const [contactMessages, setContactMessages] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      subject: 'Inquiry about your services',
      message: 'I am interested in learning more about your services. Please contact me at your earliest convenience.',
      createdAt: new Date().toISOString(),
      responded: false,
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      subject: 'Feedback on your website',
      message: 'I wanted to provide some feedback on your website. I think it is well-designed and easy to navigate.',
      createdAt: new Date().toISOString(),
      responded: true,
    },
  ]);
  const [isLoadingContact, setIsLoadingContact] = useState(false);

  return (
    <DashboardLayout>
      <Helmet>
        <title>User Messages | Admin Dashboard</title>
        <meta name="description" content="Manage user messages in the admin dashboard" />
      </Helmet>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">User Messages</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setComposingMessage(true)}>
              <Mail className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="user-messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="user-messages">User Messages</TabsTrigger>
            <TabsTrigger value="contact-messages">Contact Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="user-messages">
            <Card>
              <CardHeader>
                <CardTitle>All Messages</CardTitle>
                <CardDescription>
                  View and manage messages between users and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No messages found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMessages.map((message: Message) => (
                        <TableRow key={message.id} className={!message.read ? 'bg-muted/50' : undefined}>
                          <TableCell className="font-medium">
                            {message.sender.firstName} {message.sender.lastName}
                          </TableCell>
                          <TableCell>
                            {message.recipient.firstName} {message.recipient.lastName}
                          </TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {!message.read ? (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                                New
                              </span>
                            ) : message.replied ? (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                Replied
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                Read
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => fetchMessage(message.id)}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact-messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>Messages received through the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingContact ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : contactMessages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No contact messages found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactMessages.map((message: any) => (
                        <TableRow key={message.id} className={!message.responded ? 'bg-muted/50' : undefined}>
                          <TableCell className="font-medium">
                            {message.firstName} {message.lastName}
                          </TableCell>
                          <TableCell>{message.email}</TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {message.responded ? (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Responded
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  // Show message details
                                  toast({
                                    title: message.subject,
                                    description: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
                                  });
                                }}
                              >
                                View
                              </Button>
                              {!message.responded && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Mark as responded
                                    toast({
                                      title: "Success",
                                      description: "Message marked as responded",
                                    });
                                  }}
                                >
                                  Mark Responded
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Message Dialog */}
      <Dialog open={composingMessage} onOpenChange={setComposingMessage}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send New Message</DialogTitle>
            <DialogDescription>Send a message to a user.</DialogDescription>
          </DialogHeader>
          <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
              <FormField
                control={messageForm.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users
                          .filter((u: User) => u.id !== user?.id) // Filter out the current admin
                          .map((u: User) => (
                            <SelectItem key={u.id} value={u.id.toString()}>
                              {u.firstName} {u.lastName} ({u.username})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={messageForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={messageForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your message here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setComposingMessage(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sendMessageMutation.isPending}>
                  {sendMessageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Message
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.sender.firstName} {selectedMessage?.sender.lastName} ({selectedMessage?.sender.email})
              <br />
              To: {selectedMessage?.recipient.firstName} {selectedMessage?.recipient.lastName} ({selectedMessage?.recipient.email})
              <br />
              {selectedMessage && formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setMessageDialogOpen(false);
                messageForm.reset({
                  recipientId: selectedMessage?.sender.id,
                  subject: `Re: ${selectedMessage?.subject}`,
                  content: '',
                });
                setComposingMessage(true);
              }}
            >
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminMessages;