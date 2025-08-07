import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/db-types";

export type Project = Tables<'projects'> & {
  team_lead_info?: {
    display_name: string;
    avatar_path?: string;
  };
  college_name?: string;
  member_count?: number;
  request_count?: number;
  user_request_status?: 'pending' | 'approved' | 'rejected' | null;
};

export type ProjectRequest = Tables<'project_requests'> & {
  project_info?: {
    title: string;
  };
  student_info?: {
    display_name: string;
    avatar_path?: string;
  };
};

export function useProjects(filters?: {
  search?: string;
  skills?: string[];
  status?: 'open' | 'in-progress' | 'completed';
}) {
  const { user } = useUser();

  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          team_lead_info:users!projects_team_lead_fkey(display_name, avatar_path),
          colleges(name)
        `)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply skills filter
      if (filters?.skills && filters.skills.length > 0) {
        query = query.overlaps('required_skills', filters.skills);
      }

      // Apply status filter
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      if (!data) return [];

      // Get member counts and request counts for each project
      const projectIds = data.map(p => p.id);
      
      const [memberCountsResult, requestCountsResult, userRequestsResult] = await Promise.all([
        supabase
          .from('project_requests')
          .select('project_id')
          .eq('status', 'approved')
          .in('project_id', projectIds),
        supabase
          .from('project_requests')
          .select('project_id')
          .in('project_id', projectIds),
        user?.role === 'student' ? supabase
          .from('project_requests')
          .select('project_id, status')
          .eq('student_id', user.id)
          .in('project_id', projectIds) : null
      ]);

      // Count members and requests per project
      const memberCounts = memberCountsResult.data?.reduce((acc, req) => {
        acc[req.project_id] = (acc[req.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const requestCounts = requestCountsResult.data?.reduce((acc, req) => {
        acc[req.project_id] = (acc[req.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return data.map(project => ({
        ...project,
        college_name: project.colleges?.[0]?.name,
        team_lead_info: project.team_lead_info?.[0],
        member_count: memberCounts[project.id] || 0,
        request_count: requestCounts[project.id] || 0,
        user_request_status: userRequestsResult?.data?.find(req => req.project_id === project.id)?.status || null
      }));
    },
    enabled: !!user,
  });
}

export function useMyProjects() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['my-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          colleges(name)
        `)
        .eq('team_lead', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my projects:', error);
        throw error;
      }

      if (!data) return [];

      // Get member counts for each project
      const projectIds = data.map(p => p.id);
      const { data: memberCounts } = await supabase
        .from('project_requests')
        .select('project_id')
        .eq('status', 'approved')
        .in('project_id', projectIds);

      const memberCountMap = memberCounts?.reduce((acc, req) => {
        acc[req.project_id] = (acc[req.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return data.map(project => ({
        ...project,
        college_name: project.colleges?.[0]?.name,
        member_count: memberCountMap[project.id] || 0
      }));
    },
    enabled: !!user?.id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (projectData: Omit<TablesInsert<'projects'>, 'team_lead' | 'college_id'>) => {
      if (!user?.id || !user?.college_id) {
        throw new Error('User not found or missing college ID');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          team_lead: user.id,
          college_id: user.college_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success('Project created successfully!');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & TablesUpdate<'projects'>) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success('Project updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project. Please try again.');
    },
  });
}

export function useProjectRequests(projectId?: string) {
  return useQuery({
    queryKey: ['project-requests', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_requests')
        .select(`
          *,
          users!project_requests_student_id_fkey(display_name, avatar_path)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project requests:', error);
        throw error;
      }

      return data?.map(request => ({
        ...request,
        student_info: {
          display_name: (request.users as any)?.display_name || 'Unknown Student',
          avatar_path: (request.users as any)?.avatar_path
        }
      })) || [];
    },
    enabled: !!projectId,
  });
}

export function useSubmitProjectRequest() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (requestData: {
      project_id: string;
      message?: string;
      skills?: string[];
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('project_requests')
        .insert({
          project_id: requestData.project_id,
          student_id: user.id,
          message: requestData.message,
          skills: requestData.skills,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting project request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-requests'] });
      toast.success('Join request sent successfully!');
    },
    onError: (error) => {
      console.error('Error submitting project request:', error);
      toast.error('Failed to send join request. Please try again.');
    },
  });
}

export function useUpdateProjectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, response_message }: {
      id: string;
      status: 'approved' | 'rejected';
      response_message?: string;
    }) => {
      const { data, error } = await supabase
        .from('project_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-requests'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Request ${data.status} successfully!`);
    },
    onError: (error) => {
      console.error('Error updating project request:', error);
      toast.error('Failed to update request. Please try again.');
    },
  });
}

// Project Reactions Hooks
export function useProjectReactions(projectId: string) {
  return useQuery({
    queryKey: ['project-reactions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_reactions')
        .select(`
          *,
          users(display_name, avatar_path)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project reactions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ projectId, emoji = '❤️' }: { projectId: string; emoji?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('project_reactions')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('project_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add reaction
        const { data, error } = await supabase
          .from('project_reactions')
          .insert({
            project_id: projectId,
            user_id: user.id,
            emoji: emoji
          })
          .select()
          .single();

        if (error) throw error;
        return { action: 'added', data };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-reactions', variables.projectId] });
    },
    onError: (error) => {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to update reaction');
    },
  });
}

// Project Comments Hooks
export function useProjectComments(projectId: string) {
  return useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          *,
          users(display_name, avatar_path)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching project comments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string; content: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: content.trim(),
          edited: false
        })
        .select(`
          *,
          users(display_name, avatar_path)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', data.project_id] });
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, projectId }: { commentId: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return { commentId, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', data.projectId] });
      toast.success('Comment deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    },
  });
}
