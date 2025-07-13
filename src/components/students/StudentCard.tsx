
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, MessageSquare, UserCheck, ExternalLink } from 'lucide-react';
import { Student } from '@/types/db-types';
import { ReportModal } from './ReportModal';
import { SessionScheduleModal } from './SessionScheduleModal';

interface StudentCardProps {
  student: Student & {
    user: {
      id: string;
      display_name: string;
      email: string;
      avatar_path?: string;
    };
    department: {
      name: string;
    };
  };
  userRole: 'faculty' | 'mentor' | 'platform_admin';
  onReport?: (studentId: string, reason: string, message?: string) => void;
  onScheduleSession?: (studentId: string, sessionData: any) => void;
}

export function StudentCard({ student, userRole, onReport, onScheduleSession }: StudentCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleReport = (reason: string, message?: string) => {
    onReport?.(student.user_id, reason, message);
    setShowReportModal(false);
  };

  const handleScheduleSession = (sessionData: any) => {
    onScheduleSession?.(student.user_id, sessionData);
    setShowSessionModal(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.user.avatar_path} />
              <AvatarFallback>{getInitials(student.user.display_name || 'Student')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{student.user.display_name}</h3>
              <p className="text-sm text-muted-foreground">{student.user.email}</p>
              <p className="text-sm text-muted-foreground">{student.department.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge variant="outline">Year {student.year}</Badge>
            <Badge variant="secondary">Sem {student.semester}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Student Bio */}
        {student.bio && (
          <p className="text-sm text-muted-foreground">{student.bio}</p>
        )}

        {/* Skills */}
        {student.skills && student.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {student.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {student.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{student.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex space-x-2">
          {student.github_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={student.github_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                GitHub
              </a>
            </Button>
          )}
          {student.linkedin_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                LinkedIn
              </a>
            </Button>
          )}
          {student.portfolio_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Portfolio
              </a>
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-2">
          <div className="flex space-x-2">
            {userRole === 'mentor' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessionModal(true)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Session
              </Button>
            )}
            
            {(userRole === 'faculty' || userRole === 'platform_admin') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportModal(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Report Issue
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Contact
          </Button>
        </div>

        {/* Modals */}
        <ReportModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          onSubmit={handleReport}
          studentName={student.user.display_name || 'Student'}
        />

        <SessionScheduleModal
          open={showSessionModal}
          onOpenChange={setShowSessionModal}
          onSubmit={handleScheduleSession}
          studentName={student.user.display_name || 'Student'}
        />
      </CardContent>
    </Card>
  );
}
