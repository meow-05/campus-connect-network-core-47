
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SessionScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sessionData: {
    title: string;
    scheduledAt: string;
    requestType: string;
    notes?: string;
  }) => void;
  studentName: string;
}

const SESSION_TYPES = [
  'career_advice',
  'skill_development', 
  'project_guidance',
  'academic_support'
];

export function SessionScheduleModal({ open, onOpenChange, onSubmit, studentName }: SessionScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [requestType, setRequestType] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title || !scheduledAt || !requestType) return;
    
    onSubmit({
      title,
      scheduledAt,
      requestType,
      notes: notes || undefined
    });
    
    // Reset form
    setTitle('');
    setScheduledAt('');
    setRequestType('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Session - {studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="e.g., Career Guidance Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="scheduledAt">Date & Time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div>
            <Label>Session Type</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="career_advice">Career Advice</SelectItem>
                <SelectItem value="skill_development">Skill Development</SelectItem>
                <SelectItem value="project_guidance">Project Guidance</SelectItem>
                <SelectItem value="academic_support">Academic Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or agenda items..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title || !scheduledAt || !requestType}>
              Schedule Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
