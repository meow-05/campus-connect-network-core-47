import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { useMentorProfile } from '@/hooks/useMentorProfile';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { ExpertiseSection } from '@/components/profile/ExpertiseSection';
import { supabase } from '@/integrations/supabase/client';

export default function ProfileViewer() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user role first
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId) {
        setError('User ID not provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user role for userId:', userId);
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        console.log('User role fetch result:', { data, error: fetchError });

        if (fetchError) {
          console.error('Error fetching user role:', fetchError);
          throw fetchError;
        }

        if (!data) {
          console.error('No user data found for userId:', userId);
          setError('User not found');
          return;
        }

        console.log('User role found:', data.role);
        setUserRole(data.role);
      } catch (err) {
        setError('Failed to fetch user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userId]);

  // State for faculty profile
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState<string | null>(null);

  // Use appropriate profile hook based on role
  const studentProfile = useStudentProfile(userRole === 'student' ? userId : undefined);
  const mentorProfile = useMentorProfile(userRole === 'mentor' ? userId : undefined);

  // Fetch faculty profile separately
  useEffect(() => {
    const fetchFacultyProfile = async () => {
      if (userRole !== 'faculty' || !userId) return;

      setFacultyLoading(true);
      setFacultyError(null);

      try {
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
            college_departments!department_id (
              name
            )
          `)
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setFacultyProfile(data);
      } catch (err) {
        setFacultyError('Failed to fetch faculty profile');
      } finally {
        setFacultyLoading(false);
      }
    };

    fetchFacultyProfile();
  }, [userRole, userId]);

  // Get the appropriate profile data
  const getProfileData = () => {
    switch (userRole) {
      case 'student':
        return {
          profile: studentProfile.profile,
          isLoading: studentProfile.isLoading,
          error: studentProfile.error,
          type: 'student' as const
        };
      case 'faculty':
        return {
          profile: facultyProfile,
          isLoading: facultyLoading,
          error: facultyError,
          type: 'faculty' as const
        };
      case 'mentor':
        return {
          profile: mentorProfile.profile,
          isLoading: mentorProfile.loading,
          error: mentorProfile.error,
          type: 'mentor' as const
        };
      default:
        return {
          profile: null,
          isLoading: false,
          error: 'Unknown user role',
          type: 'student' as const
        };
    }
  };

  const { profile, isLoading: profileLoading, error: profileError, type } = getProfileData();

  if (loading || profileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || profileError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground">
            {(error || profileError)?.toString() || 'There was a problem loading the profile.'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/pages/common/connections')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Connections
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">
            Profile information is not available.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/pages/common/connections')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Connections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/pages/common/connections')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {profile?.users?.display_name || profile?.user?.display_name || profile?.users?.email || profile?.user?.email || 'User'}'s Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard 
            profile={profile} 
            isOwnProfile={false}
            type={type}
          />
          
          {/* Skills section for students */}
          {type === 'student' && (
            <SkillsSection profile={profile} />
          )}
          
          {/* Expertise section for mentors */}
          {type === 'mentor' && profile.expertise && (
            <ExpertiseSection expertise={profile.expertise} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SocialLinks profile={profile} type={type} />
        </div>
      </div>
    </div>
  );
}