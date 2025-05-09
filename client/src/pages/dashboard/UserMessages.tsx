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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowUpRight, RefreshCw } from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
  replied: boolean;
  sender?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
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

const replyFormSchema = z.object({
  content: z.string().min(1, {
    message: 'Reply content is required',
  }),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

const UserMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('received');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [composingMessage, setComposingMessage] = useState(false);

  // Form for new message
  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipientId: 1, // Default to admin ID 1
      subject: '',
      content: '',
    },
  });

  // Form for replying to a message
  const replyForm = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Fetch received messages
  const {
    data: receivedMessages = [],
    isLoading: isLoadingReceived,
    refetch: refetchReceived,
  } = useQuery<Message[]>({
    queryKey: ['/api/user/messages/received'],
    enabled: activeTab === 'received',
  });

  // Fetch sent messages
  const {
    data: sentMessages = [],
    isLoading: isLoadingSent,
    refetch: refetchSent,
  } = useQuery<Message[]>({
    queryKey: ['/api/user/messages/sent'],
    enabled: activeTab === 'sent',
  });

  // Fetch message details
  const fetchMessage = async (messageId: number) => {
    try {
      const response = await apiRequest('GET', `/api/user/messages/${messageId}`);
      const data = await response.json();
      setSelectedMessage(data);
      setMessageDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load message details',
        variant: 'destructive',
      });
    }
  };

  // Send new message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (values: MessageFormValues) => {
      try {
        const response = await apiRequest('POST', '/api/user/messages', values);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error sending message:', errorData);
          throw new Error(errorData.message || 'Failed to send message');
        }
        return response;
      } catch (error) {
        console.error('Send message error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/messages/sent'] });
      setComposingMessage(false);
      messageForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Reply to message mutation
  const replyMessageMutation = useMutation({
    mutationFn: async (values: ReplyFormValues) => {
      try {
        const response = await apiRequest('POST', `/api/user/messages/${selectedMessage?.id}/reply`, values);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error sending reply:', errorData);
          throw new Error(errorData.message || 'Failed to send reply');
        }
        return response;
      } catch (error) {
        console.error('Send reply error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/messages/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/messages/sent'] });
      setReplyDialogOpen(false);
      setMessageDialogOpen(false);
      replyForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reply',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = (values: MessageFormValues) => {
    sendMessageMutation.mutate(values);
  };

  const handleReply = (values: ReplyFormValues) => {
    if (selectedMessage) {
      replyMessageMutation.mutate(values);
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Messages | MillionareWith$25</title>
        <meta name="description" content="Manage your messages and communicate with administrators" />
      </Helmet>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'received') {
                  refetchReceived();
                } else {
                  refetchSent();
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setComposingMessage(true)}>
              <Mail className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        <Tabs defaultValue="received" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle>Received Messages</CardTitle>
                <CardDescription>Messages you've received from administrators and other users</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReceived ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : receivedMessages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No messages received yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivedMessages.map((message: Message) => (
                        <TableRow key={message.id} className={!message.read ? 'bg-muted/50' : undefined}>
                          <TableCell className="font-medium">
                            {message.sender?.firstName} {message.sender?.lastName}
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

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
                <CardDescription>Messages you've sent to administrators and other users</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSent ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sentMessages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No messages sent yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>To</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentMessages.map((message: Message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">
                            Admin
                          </TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {message.read ? (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                Read
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground">
                                Sent
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
        </Tabs>
      </div>

      {/* New Message Dialog */}
      <Dialog open={composingMessage} onOpenChange={setComposingMessage}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send New Message</DialogTitle>
            <DialogDescription>Send a message to the administrator.</DialogDescription>
          </DialogHeader>
          <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
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
              {activeTab === 'received'
                ? `From: ${selectedMessage?.sender?.firstName} ${selectedMessage?.sender?.lastName}`
                : 'To: Admin'}
              {' • '}
              {selectedMessage && formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
          </div>
          <DialogFooter>
            {activeTab === 'received' && (
              <Button onClick={() => {
                setReplyDialogOpen(true);
                setMessageDialogOpen(false);
              }}>
                Reply
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reply to: {selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              Send a reply to {selectedMessage?.sender?.firstName} {selectedMessage?.sender?.lastName}
            </DialogDescription>
          </DialogHeader>
          <Form {...replyForm}>
            <form onSubmit={replyForm.handleSubmit(handleReply)} className="space-y-4">
              <FormField
                control={replyForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reply Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your reply here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReplyDialogOpen(false);
                    setMessageDialogOpen(true);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={replyMessageMutation.isPending}>
                  {replyMessageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reply
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserMessages;