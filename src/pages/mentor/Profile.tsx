import React, { useState } from 'react';
import { useMentorProfile } from '@/hooks/useMentorProfile';
import { useUser } from '@/hooks/useUser';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ExpertiseSection } from '@/components/profile/ExpertiseSection';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { EditableMentorForm } from '@/components/profile/EditableMentorForm';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function MentorProfile() {
  const { profile, loading, error, updateProfile } = useMentorProfile();
  const { id: currentUserId, role } = useUser();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const isOwnProfile = currentUserId === profile?.user.id;
  const canEdit = isOwnProfile && role === 'mentor';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p>{error || 'Mentor profile not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <ProfileCard
          profile={profile}
          type="mentor"
          isOwnProfile={canEdit}
          onEdit={() => setEditModalOpen(true)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExpertiseSection expertise={profile.expertise} />
          <SocialLinks profile={profile} type="mentor" />
        </div>

        {canEdit && profile && (
          <EditableMentorForm
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            profile={profile}
            onSave={updateProfile}
          />
        )}
      </div>
    </div>
  );
}
