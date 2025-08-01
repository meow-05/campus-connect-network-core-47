
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, FileText, MessageSquare, UserCheck, ExternalLink, Edit, UserMinus, Shield } from 'lucide-react';
import { Student } from '@/types/db-types';
import { ReportModal } from './ReportModal';

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
}

export function StudentCard({ student, userRole, onReport }: StudentCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleReport = (reason: string, message?: string) => {
    onReport?.(student.user_id, reason, message);
    setShowReportModal(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
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
            <p className="text-sm text-muted-foreground line-clamp-2">{student.bio}</p>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                View Profile
              </Button>

              {userRole === 'mentor' && (
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Session Logs
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

              {userRole === 'platform_admin' && (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserMinus className="h-4 w-4 mr-1" />
                    Deactivate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Audit
                  </Button>
                </>
              )}
            </div>

            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile - {student.user.display_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.user.avatar_path} />
                <AvatarFallback>{getInitials(student.user.display_name || 'Student')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{student.user.display_name}</h3>
                <p className="text-muted-foreground">{student.user.email}</p>
                <p className="text-muted-foreground">{student.department.name}</p>
                <div className="flex space-x-2 mt-2">
                  <Badge>Year {student.year}</Badge>
                  <Badge variant="secondary">Semester {student.semester}</Badge>
                </div>
              </div>
            </div>

            {student.bio && (
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-muted-foreground">{student.bio}</p>
              </div>
            )}

            {student.skills && student.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              {student.github_url && (
                <Button variant="outline" asChild>
                  <a href={student.github_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GitHub Profile
                  </a>
                </Button>
              )}
              {student.linkedin_url && (
                <Button variant="outline" asChild>
                  <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {student.portfolio_url && (
                <Button variant="outline" asChild>
                  <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Portfolio
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        onSubmit={handleReport}
        studentName={student.user.display_name || 'Student'}
      />
    </>
  );
}
