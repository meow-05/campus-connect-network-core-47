import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { useUser } from '@/hooks/useUser';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { EditableProfileForm } from '@/components/profile/EditableProfileForm';

export default function StudentProfile() {
  const { user } = useUser();
  const { profile, isLoading, error, updateProfile, isUpdating } = useStudentProfile();
  const [showEditForm, setShowEditForm] = useState(false);

  // Check if current user can edit this profile (only students can edit their own profile)
  const canEdit = user?.role === 'student' && profile?.user_id === user?.id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
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
            There was a problem loading the student profile.
          </p>
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
            Student profile information is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {canEdit ? 'My Profile' : `${profile.user.display_name}'s Profile`}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard
            profile={profile}
            isOwnProfile={canEdit}
            onEdit={() => setShowEditForm(true)}
          />

          <SkillsSection profile={profile} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SocialLinks profile={profile} />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {canEdit && (
        <EditableProfileForm
          profile={profile}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSave={updateProfile}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
