import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
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
  } = useQuery({
    queryKey: ['/api/admin/user-messages'],
  });

  // Fetch all users for recipient selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Fetch message details
  const fetchMessage = async (messageId: number) => {
    try {
      const response = await apiRequest('GET', `/api/admin/user-messages/${messageId}`);
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
    mutationFn: (values: MessageFormValues) =>
      apiRequest('POST', '/api/admin/messages', values),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-messages'] });
      setComposingMessage(false);
      messageForm.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
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

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
};

export default AdminMessages;