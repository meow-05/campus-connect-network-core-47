import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MentorProfile {
  id: string;
  bio: string | null;
  expertise: string[];
  github_url: string | null;
  linkedin_url: string | null;
  verification_status: string;
  college_id: string | null;
  user: {
    id: string;
    display_name: string | null;
    email: string;
    avatar_path: string | null;
  };
  college: {
    id: string;
    name: string;
  } | null;
}

export function useMentorProfile(mentorId?: string) {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let userId = mentorId;
      
      // If no specific mentor ID provided, get current user's profile
      if (!userId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Not authenticated');
        }
        userId = user.id;
      }

      const { data, error: fetchError } = await supabase
        .from('mentors')
        .select(`
          user_id,
          bio,
          expertise,
          github_url,
          linkedin_url,
          verification_status,
          college_id,
          user:users!mentors_user_id_fkey (
            id,
            display_name,
            email,
            avatar_path
          ),
          college:colleges!mentors_college_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error('Mentor profile not found');
      }

      // Transform the data to match our interface
      const profileData: MentorProfile = {
        id: data.user_id,
        bio: data.bio,
        expertise: data.expertise || [],
        github_url: data.github_url,
        linkedin_url: data.linkedin_url,
        verification_status: data.verification_status,
        college_id: data.college_id,
        user: data.user,
        college: data.college,
      };

      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mentor profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    bio?: string;
    expertise?: string[];
    github_url?: string;
    linkedin_url?: string;
  }) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { error: updateError } = await supabase
        .from('mentors')
        .update(updates)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh profile data
      await fetchProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your mentor profile has been updated successfully.",
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [mentorId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}