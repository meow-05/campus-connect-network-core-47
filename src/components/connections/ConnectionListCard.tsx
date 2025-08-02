import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Trash2,
  Clock,
  Eye
} from 'lucide-react';
import { ConnectionUser } from '@/hooks/useConnections';

interface ConnectionListCardProps {
  user: ConnectionUser;
  onSendRequest?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onRemove?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  isProcessing?: boolean;
  showMutualConnections?: boolean;
}

export function ConnectionListCard({
  user,
  onSendRequest,
  onAccept,
  onReject,
  onRemove,
  onMessage,
  onViewProfile,
  isProcessing = false,
  showMutualConnections = false
}: ConnectionListCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return user.email.charAt(0).toUpperCase();
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'faculty': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'mentor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'platform_admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const renderActions = () => {
    if (user.connection_status === 'accepted') {
      return (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={onMessage}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button size="sm" variant="outline" onClick={onRemove}>
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      );
    }

    if (user.connection_status === 'pending' && !user.is_requester) {
      return (
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={onAccept} disabled={isProcessing}>
            <UserCheck className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={onReject} disabled={isProcessing}>
            <UserX className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      );
    }

    if (user.connection_status === 'pending' && user.is_requester) {
      return (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" disabled>
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </Button>
          <Button size="sm" variant="outline" onClick={onRemove} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {onViewProfile && (
          <Button size="sm" variant="outline" onClick={onViewProfile}>
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        )}
        <Button size="sm" onClick={onSendRequest} disabled={isProcessing}>
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_path || undefined} />
              <AvatarFallback>
                {getInitials(user.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {user.display_name || user.email}
                </h3>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                {user.department_name && (
                  <p className="text-sm text-muted-foreground">
                    {user.department_name}
                  </p>
                )}
                {user.college_name && (
                  <p className="text-sm text-muted-foreground">
                    {user.college_name}
                  </p>
                )}
                {showMutualConnections && user.mutual_connections_count !== undefined && user.mutual_connections_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {user.mutual_connections_count} mutual connection{user.mutual_connections_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}