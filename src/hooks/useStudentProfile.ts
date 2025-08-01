import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentProfile {
  id: string;
  user_id: string;
  bio?: string;
  skills?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_link?: string;
  enrollment_number?: string;
  year: number;
  semester: number;
  department_id: string;
  graduation_year?: number;
  user: {
    id: string;
    display_name: string;
    email: string;
    avatar_path?: string;
  };
  department: {
    id: string;
    name: string;
  };
  verified_skills: Array<{
    skill_name: string;
    verified_at: string;
  }>;
}

export interface ProfileUpdateData {
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_link?: string;
}

export function useStudentProfile(userId?: string) {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user if userId not provided
  useEffect(() => {
    if (!userId) {
      const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      };
      getCurrentUser();
    } else {
      setCurrentUserId(userId);
    }
  }, [userId]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['student-profile', currentUserId],
    queryFn: async (): Promise<StudentProfile | null> => {
      if (!currentUserId) return null;

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          users (
            id,
            display_name,
            email,
            avatar_path
          ),
          college_departments (
            id,
            name
          )
        `)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student profile:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Fetch verified skills separately
      const { data: verifiedSkills, error: skillsError } = await supabase
        .from('skill_verifications')
        .select('skill_name, verified_at')
        .eq('student_id', currentUserId)
        .eq('status', 'verified');

      if (skillsError) {
        console.error('Error fetching verified skills:', skillsError);
      }

      return {
        id: data.user_id,
        user_id: data.user_id,
        bio: data.bio,
        skills: data.skills || [],
        github_url: data.github_url,
        linkedin_url: data.linkedin_url,
        portfolio_url: data.portfolio_url,
        resume_link: data.resume_link,
        enrollment_number: data.enrollment_number,
        year: data.year,
        semester: data.semester,
        department_id: data.department_id,
        graduation_year: data.graduation_year,
        user: {
          id: data.users?.id || '',
          display_name: data.users?.display_name || '',
          email: data.users?.email || '',
          avatar_path: data.users?.avatar_path,
        },
        department: {
          id: data.college_departments?.id || '',
          name: data.college_departments?.name || '',
        },
        verified_skills: verifiedSkills || [],
      };
    },
    enabled: !!currentUserId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: ProfileUpdateData) => {
      if (!currentUserId) throw new Error('No user ID available');

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('user_id', currentUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile', currentUserId] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    },
  });

  const updateProfile = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
  };
}