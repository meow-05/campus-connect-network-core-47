import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Event } from '@/types/db-types';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  event_type: z.string().min(1, 'Event type is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  is_online: z.boolean(),
  virtual_link: z.string().optional(),
  physical_location: z.string().optional(),
  college_id: z.string().optional(),
  max_participants: z.number().optional().nullable(),
  registration_opens_at: z.string().optional(),
  registration_closes_at: z.string().optional(),
  preparation_docs: z.array(z.string()).optional(),
  target_departments: z.array(z.string()).optional(),
  target_years: z.array(z.number()).optional(),
}).refine((data) => {
  if (data.is_online && !data.virtual_link) {
    return false;
  }
  if (!data.is_online && !data.physical_location) {
    return false;
  }
  return true;
}, {
  message: "Location details are required",
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const { authUser } = useAuth();
  const supabase = useSupabase();
  const [departments, setDepartments] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [prepDocsInput, setPrepDocsInput] = useState('');

  const isPlatformAdmin = authUser?.role === 'platform_admin';

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      event_type: event?.event_type || '',
      start_time: event?.start_time ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm") : '',
      end_time: event?.end_time ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm") : '',
      is_online: event?.is_online || false,
      virtual_link: event?.virtual_link || '',
      physical_location: event?.physical_location || '',
      college_id: event?.college_id || (isPlatformAdmin ? '' : authUser?.college_id || ''),
      max_participants: event?.max_participants,
      registration_opens_at: event?.registration_opens_at ? format(new Date(event.registration_opens_at), "yyyy-MM-dd'T'HH:mm") : '',
      registration_closes_at: event?.registration_closes_at ? format(new Date(event.registration_closes_at), "yyyy-MM-dd'T'HH:mm") : '',
      preparation_docs: event?.preparation_docs || [],
      target_departments: event?.target_departments?.map(dept => dept.toString()) || [],
      target_years: event?.target_years || [],
    }
  });

  const watchIsOnline = form.watch('is_online');
  const watchCollegeId = form.watch('college_id');

  useEffect(() => {
    if (isPlatformAdmin) {
      fetchColleges();
    }
    fetchDepartments();
    if (event?.preparation_docs) {
      setPrepDocsInput(event.preparation_docs.join('\n'));
    }
  }, [event, isPlatformAdmin]);

  useEffect(() => {
    if (watchCollegeId) {
      fetchDepartments(watchCollegeId);
    }
  }, [watchCollegeId]);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, name')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching colleges:', error);
        return;
      }

      setColleges(data || []);
    } catch (error) {
      console.error('Error in fetchColleges:', error);
    }
  };

  const fetchDepartments = async (collegeId?: string) => {
    const targetCollegeId = collegeId || authUser?.college_id;
    if (!targetCollegeId) return;

    try {
      const { data, error } = await supabase
        .from('college_departments')
        .select('id, name, code')
        .eq('college_id', targetCollegeId);

      if (error) {
        console.error('Error fetching departments:', error);
        return;
      }

      setDepartments(data || []);
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    const targetCollegeId = data.college_id || authUser?.college_id;
    
    if (!targetCollegeId) {
      toast.error('College information missing');
      return;
    }

    try {
      setLoading(true);

      // Process preparation docs
      const prepDocs = prepDocsInput
        .split('\n')
        .filter(doc => doc.trim())
        .map(doc => doc.trim());

      const eventData = {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        start_time: data.start_time,
        end_time: data.end_time,
        is_online: data.is_online,
        is_public: true, // Always public as per requirement
        college_id: targetCollegeId,
        organizer_id: authUser!.id,
        preparation_docs: prepDocs.length > 0 ? prepDocs : null,
        target_departments: data.target_departments?.length ? data.target_departments as any : null,
        target_years: data.target_years?.length ? data.target_years : null,
        max_participants: data.max_participants || null,
        registration_opens_at: data.registration_opens_at || null,
        registration_closes_at: data.registration_closes_at || null,
        virtual_link: data.is_online ? data.virtual_link : null,
        physical_location: !data.is_online ? data.physical_location : null,
      };

      if (event) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
        toast.success('Event created successfully!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    'Workshop',
    'Seminar',
    'Conference',
    'Competition',
    'Cultural Event',
    'Sports Event',
    'Career Fair',
    'Guest Lecture',
    'Training Session',
    'Networking Event',
    'Other'
  ];

  const yearOptions = [1, 2, 3, 4];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Event Title */}
        <div className="md:col-span-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            {...form.register('title')}
            placeholder="Enter event title"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* College Selection for Platform Admin */}
        {isPlatformAdmin && (
          <div>
            <Label htmlFor="college_id">College *</Label>
            <Select 
              value={form.watch('college_id')} 
              onValueChange={(value) => form.setValue('college_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.college_id && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.college_id.message}</p>
            )}
          </div>
        )}

        {/* Event Type */}
        <div>
          <Label htmlFor="event_type">Event Type *</Label>
          <Select 
            value={form.watch('event_type')} 
            onValueChange={(value) => form.setValue('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.event_type && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.event_type.message}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            type="datetime-local"
            {...form.register('start_time')}
          />
          {form.formState.errors.start_time && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.start_time.message}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <Label htmlFor="end_time">End Time *</Label>
          <Input
            id="end_time"
            type="datetime-local"
            {...form.register('end_time')}
          />
          {form.formState.errors.end_time && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.end_time.message}</p>
          )}
        </div>

        {/* Max Participants */}
        <div>
          <Label htmlFor="max_participants">Max Participants (optional)</Label>
          <Input
            id="max_participants"
            type="number"
            min="1"
            {...form.register('max_participants', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? null : Number(value)
            })}
            placeholder="Leave empty for unlimited"
          />
        </div>

        {/* Online Event Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is_online"
            checked={watchIsOnline}
            onCheckedChange={(checked) => form.setValue('is_online', checked)}
          />
          <Label htmlFor="is_online">Online Event</Label>
        </div>
      </div>

      {/* Location Fields */}
      {watchIsOnline ? (
        <div>
          <Label htmlFor="virtual_link">Virtual Meeting Link *</Label>
          <Input
            id="virtual_link"
            {...form.register('virtual_link')}
            placeholder="https://meet.google.com/... or Zoom link"
          />
          {form.formState.errors.virtual_link && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.virtual_link.message}</p>
          )}
        </div>
      ) : (
        <div>
          <Label htmlFor="physical_location">Physical Location *</Label>
          <Input
            id="physical_location"
            {...form.register('physical_location')}
            placeholder="Building, Room Number, Address"
          />
          {form.formState.errors.physical_location && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.physical_location.message}</p>
          )}
        </div>
      )}

      {/* Registration Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="registration_opens_at">Registration Opens</Label>
          <Input
            id="registration_opens_at"
            type="datetime-local"
            {...form.register('registration_opens_at')}
          />
        </div>

        <div>
          <Label htmlFor="registration_closes_at">Registration Closes</Label>
          <Input
            id="registration_closes_at"
            type="datetime-local"
            {...form.register('registration_closes_at')}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe the event, agenda, what participants can expect..."
          rows={4}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Target Departments */}
      {departments.length > 0 && (
        <div>
          <Label>Target Departments (leave empty for all departments)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`dept-${dept.id}`}
                  checked={form.watch('target_departments')?.includes(dept.name) || false}
                  onCheckedChange={(checked) => {
                    const current = form.watch('target_departments') || [];
                    if (checked) {
                      form.setValue('target_departments', [...current, dept.name]);
                    } else {
                      form.setValue('target_departments', current.filter(d => d !== dept.name));
                    }
                  }}
                />
                <Label htmlFor={`dept-${dept.id}`} className="text-sm">
                  {dept.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Years */}
      <div>
        <Label>Target Years (leave empty for all years)</Label>
        <div className="flex gap-4 mt-2">
          {yearOptions.map((year) => (
            <div key={year} className="flex items-center space-x-2">
              <Checkbox
                id={`year-${year}`}
                checked={form.watch('target_years')?.includes(year) || false}
                onCheckedChange={(checked) => {
                  const current = form.watch('target_years') || [];
                  if (checked) {
                    form.setValue('target_years', [...current, year]);
                  } else {
                    form.setValue('target_years', current.filter(y => y !== year));
                  }
                }}
              />
              <Label htmlFor={`year-${year}`} className="text-sm">
                Year {year}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preparation Documents */}
      <div>
        <Label htmlFor="prep_docs">Preparation Documents (one URL per line)</Label>
        <Textarea
          id="prep_docs"
          value={prepDocsInput}
          onChange={(e) => setPrepDocsInput(e.target.value)}
          placeholder="https://example.com/doc1.pdf&#10;https://example.com/doc2.pdf"
          rows={3}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Enter URLs to preparation materials, one per line
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}