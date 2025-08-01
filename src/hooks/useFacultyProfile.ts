import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FacultyProfile {
  user_id: string;
  college_id: string;
  department_id: string;
  privilege: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  user: {
    id: string;
    display_name: string;
    email: string;
    avatar_path?: string;
  };
  college: {
    name: string;
  };
  department: {
    name: string;
  };
}

export interface FacultyUpdateData {
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
}

async function fetchFacultyProfile(): Promise<FacultyProfile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('faculty')
    .select(`
      user_id,
      college_id,
      department_id,
      privilege,
      bio,
      github_url,
      linkedin_url,
      users!faculty_user_id_fkey (
        id,
        display_name,
        email,
        avatar_path
      ),
      colleges!faculty_college_id_fkey (
        name
      ),
      college_departments!faculty_department_id_fkey (
        name
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch faculty profile: ${error.message}`);
  }

  if (!data) return null;

  return {
    user_id: data.user_id,
    college_id: data.college_id,
    department_id: data.department_id,
    privilege: data.privilege,
    bio: data.bio,
    github_url: data.github_url,
    linkedin_url: data.linkedin_url,
    user: Array.isArray(data.users) ? data.users[0] : data.users,
    college: Array.isArray(data.colleges) ? data.colleges[0] : data.colleges,
    department: Array.isArray(data.college_departments) ? data.college_departments[0] : data.college_departments,
  };
}

async function updateFacultyProfile(updates: FacultyUpdateData): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('faculty')
    .update(updates)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to update faculty profile: ${error.message}`);
  }
}

export function useFacultyProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['faculty-profile'],
    queryFn: fetchFacultyProfile,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: updateFacultyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}