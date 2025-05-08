import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ContactMessage } from '@shared/schema';
import { Mail, Check, MessageSquare } from 'lucide-react';

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/admin/messages'],
    select: (data: ContactMessage[]) => data.sort((a, b) => {
      // Sort by responded status first, then by date
      if (a.responded === b.responded) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.responded ? 1 : -1;
    }),
  });

  const markAsRespondedMutation = useMutation({
    mutationFn: (messageId: number) => {
      return apiRequest(`/api/admin/messages/${messageId}/respond`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
      setDialogOpen(false);
      setResponseMessage('');
      setSelectedMessage(null);
      toast({
        title: "Success",
        description: "Message marked as responded.",
      });
    },
    onError: (error) => {
      console.error('Error marking message as responded:', error);
      toast({
        title: "Error",
        description: "Failed to mark message as responded. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleOpenDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const handleMarkAsResponded = () => {
    if (selectedMessage) {
      markAsRespondedMutation.mutate(selectedMessage.id);
    }
  };

  const pendingMessages = messages.filter(message => !message.responded);
  const respondedMessages = messages.filter(message => message.responded);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">
            Manage and respond to messages from your website visitors
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending Messages 
            {pendingMessages.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingMessages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="responded">
            Responded Messages
            {respondedMessages.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {respondedMessages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : pendingMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Pending Messages</h3>
                <p className="text-muted-foreground mt-2">
                  All messages have been responded to!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingMessages.map((message) => (
                <Card key={message.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {message.subject}
                        </CardTitle>
                        <CardDescription>
                          From: {message.firstName} {message.lastName} ({message.email})
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{message.message}</p>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenDialog(message)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="responded">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : respondedMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Responded Messages</h3>
                <p className="text-muted-foreground mt-2">
                  You haven't responded to any messages yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {respondedMessages.map((message) => (
                <Card key={message.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {message.subject}
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" /> Responded
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          From: {message.firstName} {message.lastName} ({message.email})
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{message.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Respond to Message</DialogTitle>
            <DialogDescription>
              Enter your response to the contact message.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="font-semibold mb-1">{selectedMessage.subject}</p>
                <p className="text-sm mb-2">
                  From: {selectedMessage.firstName} {selectedMessage.lastName} ({selectedMessage.email})
                </p>
                <Separator className="my-2" />
                <ScrollArea className="h-24">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </ScrollArea>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Response</label>
                <Textarea 
                  rows={6}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your response here..."
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This response will be sent to {selectedMessage.email}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAsResponded}
              disabled={markAsRespondedMutation.isPending || !responseMessage.trim()}
            >
              {markAsRespondedMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}