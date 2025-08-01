import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, MessageCircle, Eye, Calendar } from 'lucide-react';
import { MentorProfile } from './hooks/useMentors';

interface MentorCardProps {
  mentor: MentorProfile;
  onViewProfile: (mentor: MentorProfile) => void;
  onBookSession: (mentor: MentorProfile) => void;
  currentUserRole: string | null;
}

export function MentorCard({ mentor, onViewProfile, onBookSession, currentUserRole }: MentorCardProps) {
  const displayName = mentor.user?.display_name || 'Unknown';
  const bio = mentor.bio || 'No bio available';
  const shortBio = bio.length > 100 ? bio.substring(0, 100) + '...' : bio;
  const collegeName = mentor.college?.name || 'External Mentor';
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6 flex-1">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={mentor.user?.avatar_path || undefined} alt={displayName} />
            <AvatarFallback className="text-lg font-semibold">
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
              {displayName}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{collegeName}</span>
            </div>
            {mentor.averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{mentor.averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({mentor.totalSessions} sessions)
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {shortBio}
        </p>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Expertise</h4>
            <div className="flex flex-wrap gap-1">
              {mentor.expertise.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {mentor.expertise.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.expertise.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(mentor)}
            className="flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Profile
          </Button>
          
          {currentUserRole === 'student' ? (
            <Button
              size="sm"
              onClick={() => onBookSession(mentor)}
              className="flex items-center justify-center"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Book Session
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex items-center justify-center opacity-50"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}