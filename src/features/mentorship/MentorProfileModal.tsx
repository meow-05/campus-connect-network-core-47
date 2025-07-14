import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Calendar, ExternalLink, Github, Linkedin, Flag, UserX, Edit } from 'lucide-react';
import { MentorProfile } from './hooks/useMentors';
import { ReportModal } from '@/components/students/ReportModal';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface MentorProfileModalProps {
  mentor: MentorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSession: (mentor: MentorProfile) => void;
}

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export function MentorProfileModal({ mentor, open, onOpenChange, onBookSession }: MentorProfileModalProps) {
  const { user: currentUser } = useUser();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  if (!mentor) return null;

  const displayName = mentor.user?.display_name || 'Unknown';
  const collegeName = mentor.college?.name || 'External Mentor';

  const handleReport = async (reason: string, message?: string) => {
    if (!currentUser?.id) return;

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reported_user_id: mentor.user_id,
          reported_by: currentUser.id,
          reason,
          message,
          role_of_reported_by: currentUser.role as any
        });

      if (error) throw error;

      toast.success('Report submitted successfully');
      setReportModalOpen(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  const handleDeactivate = async () => {
    if (!currentUser?.id || currentUser.role !== 'platform_admin') return;

    try {
      setIsDeactivating(true);
      
      // Deactivate mentor
      const { error: deactivateError } = await supabase
        .from('mentors')
        .update({ is_active: false })
        .eq('user_id', mentor.user_id);

      if (deactivateError) throw deactivateError;

      // Log activity
      const { error: logError } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: mentor.user_id,
          action_type: 'deactivated',
          performed_by: currentUser.id,
          role_of_actor: currentUser.role as any,
          notes: 'Mentor deactivated by platform admin'
        });

      if (logError) console.error('Error logging activity:', logError);

      toast.success('Mentor deactivated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deactivating mentor:', error);
      toast.error('Failed to deactivate mentor');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentor.user?.avatar_path || undefined} alt={displayName} />
                <AvatarFallback className="text-lg font-semibold">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{displayName}</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {collegeName}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {mentor.bio || 'No bio available'}
                  </p>
                </CardContent>
              </Card>

              {/* Expertise */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              {(mentor.linkedin_url || mentor.github_url) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      {mentor.linkedin_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {mentor.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={mentor.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback */}
              {mentor.feedback && mentor.feedback.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                      Feedback ({mentor.averageRating?.toFixed(1)} avg)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mentor.feedback.slice(0, 3).map((feedback, index) => (
                        <div key={feedback.id} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              {feedback.student.display_name}
                            </span>
                            {feedback.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm">{feedback.rating}/5</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feedback.feedback}
                          </p>
                        </div>
                      ))}
                      {mentor.feedback.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {mentor.feedback.length - 3} more reviews...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Stats & Availability */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold">{mentor.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold">
                        {mentor.averageRating ? mentor.averageRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specializations</span>
                    <span className="font-semibold">{mentor.expertise.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              {mentor.availability && mentor.availability.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mentor.availability.map((slot, index) => (
                        <div key={index}>
                          <p className="font-medium text-sm mb-1">
                            {DAY_NAMES[slot.day_of_week]}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {slot.time_slots.map((time, timeIndex) => (
                              <Badge key={timeIndex} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {currentUser?.role === 'student' && (
                  <Button onClick={() => onBookSession(mentor)} className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                )}

                <Button variant="outline" className="w-full" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setReportModalOpen(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>

                {currentUser?.role === 'platform_admin' && (
                  <>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDeactivate}
                      disabled={isDeactivating}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                    </Button>

                    <Button variant="outline" className="w-full" disabled>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onSubmit={handleReport}
        studentName={displayName}
      />
    </>
  );
}