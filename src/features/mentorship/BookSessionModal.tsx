import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { MentorProfile } from './hooks/useMentors';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface BookSessionModalProps {
  mentor: MentorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const REQUEST_TYPES = [
  { value: 'career_advice', label: 'Career Advice' },
  { value: 'skill_development', label: 'Skill Development' },
  { value: 'project_guidance', label: 'Project Guidance' },
  { value: 'academic_support', label: 'Academic Support' }
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export function BookSessionModal({ mentor, open, onOpenChange, onSuccess }: BookSessionModalProps) {
  const { user: currentUser } = useUser();
  const [requestType, setRequestType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  useEffect(() => {
    if (open && mentor && currentUser) {
      checkExistingRequest();
    }
  }, [open, mentor, currentUser]);

  const checkExistingRequest = async () => {
    if (!mentor || !currentUser?.id) return;

    try {
      const { data } = await supabase
        .from('mentorship_sessions')
        .select('id')
        .eq('mentor_id', mentor.user_id)
        .eq('student_id', currentUser.id)
        .in('status', ['scheduled']);

      setHasExistingRequest((data?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const handleSubmit = async () => {
    if (!mentor || !currentUser?.id || !requestType || !title.trim() || !selectedSlot) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Parse the selected slot to get scheduled time
      const [dayIndex, timeSlot] = selectedSlot.split('-');
      const dayOfWeek = parseInt(dayIndex);
      
      // For now, we'll create a scheduled time for next occurrence of this day
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + ((dayOfWeek - now.getDay() + 7) % 7 || 7));
      
      // Parse time slot (assuming format like "09:00-10:00")
      const [startTime] = timeSlot.split('-');
      const [hours, minutes] = startTime.split(':').map(Number);
      nextWeek.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('mentorship_sessions')
        .insert({
          mentor_id: mentor.user_id,
          student_id: currentUser.id,
          college_id: currentUser.college_id!,
          title: title.trim(),
          request_type: requestType as any, // This will be the enum value
          scheduled_at: nextWeek.toISOString(),
          status: 'scheduled'
        });

      if (error) {
        console.error('Error creating session:', error);
        toast.error('Failed to book session. Please try again.');
        return;
      }

      toast.success('Session booked successfully! The mentor will review your request.');
      
      // Reset form
      setRequestType('');
      setTitle('');
      setMessage('');
      setSelectedSlot('');
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mentor) return null;

  const displayName = mentor.user?.display_name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <User className="h-6 w-6" />
            <div>
              <span>Book Session with {displayName}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Fill out the details below to request a mentorship session
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {hasExistingRequest && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You already have a pending session request with this mentor. 
              Please wait for them to respond before booking another session.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Request Type */}
          <div>
            <Label htmlFor="request-type">Request Type *</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type of mentorship" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Session Title *</Label>
            <Textarea
              id="title"
              placeholder="Brief title for your session (e.g., 'React Development Guidance')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Request Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Describe what you'd like to discuss or get help with..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Available Slots */}
          {mentor.availability && mentor.availability.length > 0 && (
            <div>
              <Label>Available Time Slots *</Label>
              <div className="mt-2 space-y-3">
                {mentor.availability.map((slot, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">{DAY_NAMES[slot.day_of_week]}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {slot.time_slots.map((time, timeIndex) => (
                        <Button
                          key={timeIndex}
                          variant={selectedSlot === `${slot.day_of_week}-${time}` ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSlot(`${slot.day_of_week}-${time}`)}
                          className="justify-start text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedSlot && (
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mr-2">
                    Selected: {(() => {
                      const [dayIndex, timeSlot] = selectedSlot.split('-');
                      return `${DAY_NAMES[parseInt(dayIndex)]} at ${timeSlot}`;
                    })()}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {(!mentor.availability || mentor.availability.length === 0) && (
            <div className="bg-gray-50 dark:bg-gray-900/20 border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                This mentor hasn't set up their availability yet. 
                Your request will be sent and they will contact you to schedule.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                hasExistingRequest || 
                !requestType || 
                !title.trim() || 
                (mentor.availability?.length > 0 && !selectedSlot)
              }
            >
              {isSubmitting ? 'Booking...' : 'Book Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}