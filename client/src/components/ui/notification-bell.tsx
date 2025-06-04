import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  status: string;
  type: string;
  link: string | null;
  createdAt: string;
  entityId: number | null;
  entityType: string | null;
}

interface NotificationBellProps {
  userRole: "user" | "admin";
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localReadIds, setLocalReadIds] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to fetch unread notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [userRole === "admin" ? "/api/admin/notifications" : "/api/user/notifications/unread"],
    refetchInterval: 60000, // Poll for new notifications every minute
    queryFn: async () => {
      try {
        console.log('Fetching notifications for', userRole);
        // Return demo notifications until backend is fixed
        
        // For demo purpose - create comprehensive notifications for different user roles
        if (userRole === "admin") {
          return [
            {
              id: 1,
              userId: 1,
              title: 'New User Registration',
              message: 'Jane Smith has registered and joined the platform',
              status: 'unread',
              type: 'registration',
              link: '/admin/members',
              createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
              entityId: 25,
              entityType: 'user'
            },
            {
              id: 2,
              userId: 1,
              title: 'New Deposit Request',
              message: 'John Doe has initiated a deposit of $500 USD',
              status: 'unread',
              type: 'deposit_request',
              link: '/admin/transactions',
              createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
              entityId: 123,
              entityType: 'transaction'
            },
            {
              id: 3,
              userId: 1,
              title: 'New Withdrawal Request',
              message: 'Sarah Johnson has requested a withdrawal of $200 USD',
              status: 'unread',
              type: 'withdrawal_request',
              link: '/admin/withdrawals',
              createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
              entityId: 456,
              entityType: 'transaction'
            },
            {
              id: 4,
              userId: 1,
              title: 'New Message',
              message: 'You have received a new message from Mike Wilson',
              status: 'unread',
              type: 'message',
              link: '/admin/user-messages',
              createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
              entityId: 789,
              entityType: 'message'
            }
          ];
        } else {
          return [
            {
              id: 1,
              userId: 2,
              title: 'Welcome to MillionareWith$25!',
              message: 'Welcome to our platform! Complete your profile and start exploring investment opportunities.',
              status: 'unread',
              type: 'welcome',
              link: '/dashboard',
              createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
              entityId: 2,
              entityType: 'user'
            },
            {
              id: 2,
              userId: 2,
              title: 'Deposit Completed',
              message: 'Your deposit of $100 USD has been successfully processed',
              status: 'unread',
              type: 'deposit_completed',
              link: '/dashboard/transactions',
              createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
              entityId: 123,
              entityType: 'transaction'
            },
            {
              id: 3,
              userId: 2,
              title: 'Referral Commission',
              message: 'You have earned $25 in referral commission',
              status: 'unread',
              type: 'referral',
              link: '/dashboard/referrals',
              createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
              entityId: 456,
              entityType: 'transaction'
            },
            {
              id: 4,
              userId: 2,
              title: 'New Referral',
              message: 'John Smith has joined using your referral link',
              status: 'unread',
              type: 'referral',
              link: '/dashboard/referrals',
              createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
              entityId: 789,
              entityType: 'user'
            },
            {
              id: 5,
              userId: 2,
              title: 'Investment Matured',
              message: 'Your Bronze plan investment has matured. Check your earnings!',
              status: 'unread',
              type: 'investment',
              link: '/dashboard/investments',
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
              entityId: 101,
              entityType: 'investment'
            }
          ];
        }
        
        // Original query - uncomment when database is ready
        /*
        const response = await apiRequest('GET', 
          userRole === "admin" ? "/api/admin/notifications" : "/api/user/notifications/unread"
        );
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        return response.json();
        */
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    }
  });
  
  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(
        "POST", 
        userRole === "admin" 
          ? `/api/admin/notifications/${notificationId}/read` 
          : `/api/user/notifications/${notificationId}/read`
      ),
    onSuccess: () => {
      // Invalidate the notifications query to refetch
      queryClient.invalidateQueries({ 
        queryKey: [userRole === "admin" ? "/api/admin/notifications" : "/api/user/notifications/unread"]
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  });

  const handleMarkAsRead = (notificationId: number) => {
    // First update the local state to immediately reflect the change in the UI
    setLocalReadIds(prev => [...prev, notificationId]);
    
    // Then attempt to update the server state
    markAsReadMutation.mutate(notificationId);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
      case "deposit_pending":
      case "deposit_completed":
      case "deposit_request":
        return "💰";
      case "withdrawal_request":
      case "withdrawal_approved":
      case "withdrawal_rejected":
        return "💸";
      case "message":
        return "💬";
      case "system":
        return "🔔";
      case "referral":
        return "👥";
      case "investment":
        return "📈";
      case "registration":
        return "👤";
      case "welcome":
        return "🎉";
      default:
        return "🔔";
    }
  };
  
  // Filter out notifications that have been locally marked as read
  const filteredNotifications = notifications.filter(
    notification => !localReadIds.includes(notification.id)
  );
  
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {filteredNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px]"
            >
              {filteredNotifications.length > 9 ? "9+" : String(filteredNotifications.length)}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border bg-muted/50">
          <h4 className="text-sm font-medium">Notifications</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-5 w-5 border-2 border-r-transparent border-primary rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification: Notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    notification.status === "unread" && "bg-muted/30"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {filteredNotifications.length > 0 && (
          <div className="p-2 border-t border-border bg-muted/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;