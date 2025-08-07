import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { ExpertiseSection } from '@/components/profile/ExpertiseSection';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  user: {
    id: string;
    display_name: string;
    email: string;
    avatar_path?: string;
  };
  role: string;
  college?: {
    name: string;
  };
  department?: {
    name: string;
  };
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  skills?: string[];
  expertise?: string[];
  verified_skills?: any[];
}

export default function ProfileViewer() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, get the user's basic info and role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, display_name, email, avatar_path, role')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }

        let profileData: UserProfile = {
          user: {
            id: userData.id,
            display_name: userData.display_name,
            email: userData.email,
            avatar_path: userData.avatar_path
          },
          role: userData.role
        };

        // Fetch role-specific data
        if (userData.role === 'student') {
          const { data: studentData } = await supabase
            .from('students')
            .select(`
              bio,
              github_url,
              linkedin_url,
              skills,
              college_departments!department_id (name),
              colleges!college_id (name)
            `)
            .eq('user_id', userId)
            .single();

          if (studentData) {
            profileData = {
              ...profileData,
              bio: studentData.bio,
              github_url: studentData.github_url,
              linkedin_url: studentData.linkedin_url,
              skills: studentData.skills,
              college: Array.isArray(studentData.colleges) ? studentData.colleges[0] : studentData.colleges,
              department: Array.isArray(studentData.college_departments) ? studentData.college_departments[0] : studentData.college_departments
            };
          }

          // Get verified skills
          const { data: verifiedSkills } = await supabase
            .from('skill_verifications')
            .select('skill_name, status, verified_at')
            .eq('student_id', userId)
            .eq('status', 'verified');

          if (verifiedSkills) {
            profileData.verified_skills = verifiedSkills;
          }

        } else if (userData.role === 'faculty') {
          const { data: facultyData } = await supabase
            .from('faculty')
            .select(`
              bio,
              github_url,
              linkedin_url,
              college_departments!department_id (name),
              colleges!college_id (name)
            `)
            .eq('user_id', userId)
            .single();

          if (facultyData) {
            profileData = {
              ...profileData,
              bio: facultyData.bio,
              github_url: facultyData.github_url,
              linkedin_url: facultyData.linkedin_url,
              college: Array.isArray(facultyData.colleges) ? facultyData.colleges[0] : facultyData.colleges,
              department: Array.isArray(facultyData.college_departments) ? facultyData.college_departments[0] : facultyData.college_departments
            };
          }

        } else if (userData.role === 'mentor') {
          const { data: mentorData } = await supabase
            .from('mentors')
            .select(`
              bio,
              expertise,
              github_url,
              linkedin_url,
              colleges!college_id (name)
            `)
            .eq('user_id', userId)
            .single();

          if (mentorData) {
            profileData = {
              ...profileData,
              bio: mentorData.bio,
              expertise: mentorData.expertise,
              github_url: mentorData.github_url,
              linkedin_url: mentorData.linkedin_url,
              college: Array.isArray(mentorData.colleges) ? mentorData.colleges[0] : mentorData.colleges
            };
          }
        }

        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground">
            {error}
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
          {profile.user.display_name || profile.user.email}'s Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard 
            profile={profile as any} 
            isOwnProfile={false}
            type={profile.role as 'student' | 'faculty' | 'mentor'}
          />
          
          {/* Skills section for students */}
          {profile.role === 'student' && profile.skills && (
            <SkillsSection profile={profile as any} />
          )}
          
          {/* Expertise section for mentors */}
          {profile.role === 'mentor' && profile.expertise && (
            <ExpertiseSection expertise={profile.expertise} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SocialLinks profile={profile as any} type={profile.role as 'student' | 'faculty' | 'mentor'} />
        </div>
      </div>
    </div>
  );
}