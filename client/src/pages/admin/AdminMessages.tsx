import React from 'react';
import InternalMessaging from '@/components/chat/InternalMessaging';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UsersRound, MessageSquare, Bell } from 'lucide-react';

const AdminMessages: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Communications</h1>
          <p className="text-muted-foreground">
            Manage all communications with members in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            <Bell className="mr-1 h-3 w-3" />
            2 Unread Messages
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="direct-messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="direct-messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
            <MessageSquare className="mr-2 h-4 w-4" />
            Direct Messages
          </TabsTrigger>
          <TabsTrigger value="member-list" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
            <UsersRound className="mr-2 h-4 w-4" />
            Members Directory
          </TabsTrigger>
        </TabsList>
        <TabsContent value="direct-messages" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Messaging System</CardTitle>
              <CardDescription>
                Send and receive messages from members in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InternalMessaging currentUserId={1} isAdmin={true} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="member-list" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>
                View all platform members and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Name</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block font-medium">Status</div>
                    <div className="hidden md:block font-medium">Role</div>
                    <div className="font-medium">Actions</div>
                  </div>
                </div>
                <div className="divide-y">
                  {/* Member row examples */}
                  {[
                    { id: 2, name: 'John Smith', status: 'online', role: 'member' },
                    { id: 3, name: 'Sarah Johnson', status: 'offline', role: 'member' },
                    { id: 4, name: 'Michael Brown', status: 'away', role: 'member' },
                    { id: 5, name: 'Emma Wilson', status: 'online', role: 'member' },
                  ].map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">ID: {member.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            member.status === 'online' ? 'bg-green-500' : 
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm">{member.status}</span>
                        </div>
                        <div className="hidden md:block text-sm">{member.role}</div>
                        <button 
                          className="text-sm text-yellow-600 hover:text-yellow-800"
                          onClick={() => {
                            // In a real implementation, this would initiate a conversation
                            console.log(`Messaging ${member.name}`);
                          }}
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMessages;