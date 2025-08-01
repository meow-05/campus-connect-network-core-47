import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Mail, GraduationCap, Building2 } from 'lucide-react';
import { StudentProfile } from '@/hooks/useStudentProfile';

interface ProfileCardProps {
  profile: StudentProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function ProfileCard({ profile, isOwnProfile = false, onEdit }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.user.avatar_path} />
              <AvatarFallback className="text-lg">
                {getInitials(profile.user.display_name || 'Student')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{profile.user.display_name}</h1>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile.user.email}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center">
                  <Building2 className="h-3 w-3 mr-1" />
                  {profile.department.name}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Year {profile.year}
                </Badge>
                <Badge variant="secondary">
                  Sem {profile.semester}
                </Badge>
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      {profile.bio && (
        <CardContent className="pt-0">
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}