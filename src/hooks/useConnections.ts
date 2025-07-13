
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';

export interface ConnectionUser {
  id: string;
  display_name: string | null;
  email: string;
  role: 'student' | 'faculty' | 'mentor' | 'platform_admin';
  department_name: string | null;
  college_name: string | null;
  avatar_path: string | null;
  mutual_connections_count?: number;
  connection_status?: 'pending' | 'accepted' | 'rejected';
  connection_id?: string;
  is_requester?: boolean;
}

export interface UserConnection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function useConnections() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Get user's connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for each connection
      const connectionUsers: ConnectionUser[] = [];
      
      for (const connection of data) {
        const otherUserId = connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;
        
        const { data: profiles } = await supabase.rpc('get_user_profile', { user_id: otherUserId });
        
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          connectionUsers.push({
            ...profile,
            connection_status: connection.status,
            connection_id: connection.id,
            is_requester: connection.requester_id === user.id
          });
        }
      }

      return connectionUsers;
    },
    enabled: !!user?.id
  });

  // Get suggested connections
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['suggested-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_suggested_connections', { current_user_id: user.id });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Send connection request
  const sendConnectionRequest = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['suggested-connections'] });
      toast.success('Connection request sent!');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Connection request already exists');
      } else {
        toast.error('Failed to send connection request');
      }
    }
  });

  // Accept connection request
  const acceptConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request accepted!');
    },
    onError: () => {
      toast.error('Failed to accept connection request');
    }
  });

  // Reject connection request
  const rejectConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request rejected');
    },
    onError: () => {
      toast.error('Failed to reject connection request');
    }
  });

  // Remove connection
  const removeConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['suggested-connections'] });
      toast.success('Connection removed');
    },
    onError: () => {
      toast.error('Failed to remove connection');
    }
  });

  // Filter connections by status
  const acceptedConnections = connections.filter(c => c.connection_status === 'accepted');
  const pendingRequests = connections.filter(c => c.connection_status === 'pending' && !c.is_requester);
  const sentRequests = connections.filter(c => c.connection_status === 'pending' && c.is_requester);

  return {
    connections: acceptedConnections,
    pendingRequests,
    sentRequests,
    suggestions,
    connectionsLoading,
    suggestionsLoading,
    sendConnectionRequest: sendConnectionRequest.mutate,
    acceptConnection: acceptConnection.mutate,
    rejectConnection: rejectConnection.mutate,
    removeConnection: removeConnection.mutate,
    isProcessing: sendConnectionRequest.isPending || acceptConnection.isPending || 
                  rejectConnection.isPending || removeConnection.isPending
  };
}
