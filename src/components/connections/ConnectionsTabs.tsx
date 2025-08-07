import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Clock, Search } from 'lucide-react';

import { ConnectionListCard } from './ConnectionListCard';
import { useConnections } from '@/hooks/useConnections';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';

export function ConnectionsTabs() {
  const navigate = useNavigate();

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
    isProcessing,
  } = useConnections();

  const handleMessage = (userId: string) => {
    // TODO: Implement messaging functionality
    console.log('Message user:', userId);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/pages/common/profile/${userId}`);
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
    <Tabs defaultValue="discover" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="discover" className="flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span>Discover</span>
        </TabsTrigger>

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
          {(pendingRequests.length + sentRequests.length) > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingRequests.length + sentRequests.length}
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
      </TabsList>

      {/* Discover Tab */}
      <TabsContent value="discover" className="space-y-4">
        {suggestionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <EmptyState
            title="No suggestions available"
            description="We couldn't find any connection suggestions for you at the moment."
          />
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <ConnectionListCard
                key={suggestion.id}
                user={suggestion}
                onSendRequest={() => sendConnectionRequest(suggestion.id)}
                onViewProfile={() => handleViewProfile(suggestion.id)}
                isProcessing={isProcessing}
                showMutualConnections
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Connections Tab */}
      <TabsContent value="connections" className="space-y-4">
        {connections.length === 0 ? (
          <EmptyState
            title="No connections yet"
            description="Start connecting with fellow students, faculty, and mentors in your network."
          />
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => (
              <ConnectionListCard
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

      {/* Requests Tab */}
      <TabsContent value="requests" className="space-y-4">
        {pendingRequests.length === 0 && sentRequests.length === 0 ? (
          <EmptyState
            title="No requests"
            description="You don't have any pending connection requests at the moment."
          />
        ) : (
          <div className="space-y-4">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <ConnectionListCard
                      key={request.id}
                      user={request}
                      onAccept={() => acceptConnection(request.connection_id!)}
                      onReject={() => rejectConnection(request.connection_id!)}
                      isProcessing={isProcessing}
                    />
                  ))}
                </div>
              </div>
            )}

            {sentRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Sent Requests</h3>
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <ConnectionListCard
                      key={request.id}
                      user={request}
                      onRemove={() => removeConnection(request.connection_id!)}
                      isProcessing={isProcessing}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* Sent Tab */}
      <TabsContent value="sent" className="space-y-4">
        {sentRequests.length === 0 ? (
          <EmptyState
            title="No sent requests"
            description="You haven't sent any connection requests yet."
          />
        ) : (
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <ConnectionListCard
                key={request.id}
                user={request}
                onRemove={() => removeConnection(request.connection_id!)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
