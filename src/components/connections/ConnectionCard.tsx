
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock
} from 'lucide-react';
import { ConnectionUser } from '@/hooks/useConnections';

interface ConnectionCardProps {
  user: ConnectionUser;
  onSendRequest?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onRemove?: () => void;
  onMessage?: () => void;
  isProcessing?: boolean;
  showMutualConnections?: boolean;
}

export function ConnectionCard({
  user,
  onSendRequest,
  onAccept,
  onReject,
  onRemove,
  onMessage,
  isProcessing = false,
  showMutualConnections = false
}: ConnectionCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return user.email.charAt(0).toUpperCase();
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'platform_admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <Button size="sm" onClick={onSendRequest} disabled={isProcessing}>
        <UserPlus className="w-4 h-4 mr-2" />
        Connect
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar_path || undefined} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {user.display_name || user.email}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {user.department_name && (
                    <span className="text-sm text-muted-foreground">
                      {user.department_name}
                    </span>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderActions()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            {user.college_name && (
              <p className="text-sm text-muted-foreground">
                {user.college_name}
              </p>
            )}
          </div>
          {showMutualConnections && user.mutual_connections_count !== undefined && (
            <p className="text-sm text-muted-foreground">
              {user.mutual_connections_count} mutual connections
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
