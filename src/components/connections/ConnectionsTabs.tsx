
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConnectionCard } from './ConnectionCard';
import { useConnections } from '@/hooks/useConnections';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { Users, UserPlus, Clock, Search } from 'lucide-react';

export function ConnectionsTabs() {
  const {
    connections,
    pendingRequests,
    sentRequests,
    suggestions,
    connectionsLoading,
    suggestionsLoading,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    removeConnection,
    isProcessing
  } = useConnections();

  const handleMessage = (userId: string) => {
    // TODO: Implement messaging functionality
    console.log('Message user:', userId);
  };

  if (connectionsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="connections" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="connections" className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Connections</span>
          {connections.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {connections.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Requests</span>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingRequests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Sent</span>
          {sentRequests.length > 0 && (
            <Badge variant="outline" className="ml-1">
              {sentRequests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="discover" className="flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span>Discover</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="connections" className="space-y-4">
        {connections.length === 0 ? (
          <EmptyState
            title="No connections yet"
            description="Start connecting with fellow students, faculty, and mentors in your network."
          />
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                user={connection}
                onMessage={() => handleMessage(connection.id)}
                onRemove={() => removeConnection(connection.connection_id!)}
                isProcessing={isProcessing}
                showMutualConnections
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="requests" className="space-y-4">
        {pendingRequests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="You don't have any pending connection requests at the moment."
          />
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <ConnectionCard
                key={request.id}
                user={request}
                onAccept={() => acceptConnection(request.connection_id!)}
                onReject={() => rejectConnection(request.connection_id!)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sent" className="space-y-4">
        {sentRequests.length === 0 ? (
          <EmptyState
            title="No sent requests"
            description="You haven't sent any connection requests yet."
          />
        ) : (
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <ConnectionCard
                key={request.id}
                user={request}
                onRemove={() => removeConnection(request.connection_id!)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="discover" className="space-y-4">
        {suggestionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <EmptyState
            title="No suggestions available"
            description="We couldn't find any connection suggestions for you at the moment."
          />
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <ConnectionCard
                key={suggestion.id}
                user={suggestion}
                onSendRequest={() => sendConnectionRequest(suggestion.id)}
                isProcessing={isProcessing}
                showMutualConnections
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
