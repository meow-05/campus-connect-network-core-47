
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { Event, EventRegistration, EventFeedback } from '@/types/db-types';
import { toast } from 'sonner';

interface EventWithDetails extends Event {
  registration_count?: number;
  user_registered?: boolean;
  user_feedback?: EventFeedback;
}

export function useEvents() {
  const { authUser } = useAuth();
  const supabase = useSupabase();
  
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('events')
        .select('*');

      // Apply role-based filtering
      if (authUser.role === 'student' || authUser.role === 'mentor') {
        // Get user's department for filtering
        const { data: userData } = await supabase
          .from('students') 
          .select('department_id')
          .eq('user_id', authUser.id)
          .single();

        if (userData?.department_id) {
          const { data: deptData } = await supabase
            .from('college_departments')
            .select('name')
            .eq('id', userData.department_id)
            .single();

          if (deptData?.name) {
            query = query.or(`is_public.eq.true,target_departments.cs.{${deptData.name}}`);
          }
        } else {
          query = query.eq('is_public', true);
        }
      }

      // Faculty and platform admins see all events in their college
      if (authUser.role === 'faculty' || authUser.role === 'platform_admin') {
        query = query.eq('college_id', authUser.college_id);
      }

      const { data: eventsData, error } = await query.order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Enhance events with registration data
      const processedEvents = await Promise.all(eventsData.map(async (event) => {
        // Get registration count
        const { count: registrationCount } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        // Check if current user is registered
        const { data: userRegistration } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', authUser.id)
          .single();

        // Get user's feedback if exists
        const { data: userFeedback } = await supabase
          .from('event_feedback')
          .select('*')
          .eq('event_id', event.id)
          .eq('user_id', authUser.id)
          .single();

        return {
          ...event,
          registration_count: registrationCount || 0,
          user_registered: !!userRegistration,
          user_feedback: userFeedback || undefined
        };
      }));

      setEvents(processedEvents);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!authUser) return { success: false, error: 'Not authenticated' };

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return { success: false, error: 'Event not found' };

      // Validation checks
      const now = new Date();
      const registrationOpens = new Date(event.registration_opens_at || event.created_at);
      const registrationCloses = new Date(event.registration_closes_at || event.start_time);

      if (now < registrationOpens) {
        return { success: false, error: 'Registration has not opened yet' };
      }

      if (now > registrationCloses) {
        return { success: false, error: 'Registration has closed' };
      }

      if (event.max_participants && event.registration_count >= event.max_participants) {
        return { success: false, error: 'Event is full' };
      }

      if (event.user_registered) {
        return { success: false, error: 'Already registered for this event' };
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: authUser.id
        });

      if (error) throw error;

      toast.success('Successfully registered for event!');
      await fetchEvents(); // Refresh events
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register for event';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const submitFeedback = async (eventId: string, rating?: number, comment?: string) => {
    if (!authUser) return { success: false, error: 'Not authenticated' };

    try {
      const feedbackData = {
        event_id: eventId,
        user_id: authUser.id,
        rating: rating || null,
        comment: comment?.trim() || null
      };

      // Check if feedback already exists
      const { data: existingFeedback } = await supabase
        .from('event_feedback')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', authUser.id)
        .single();

      if (existingFeedback) {
        // Update existing feedback
        const { error } = await supabase
          .from('event_feedback')
          .update(feedbackData)
          .eq('id', existingFeedback.id);

        if (error) throw error;
      } else {
        // Create new feedback
        const { error } = await supabase
          .from('event_feedback')
          .insert(feedbackData);

        if (error) throw error;
      }

      toast.success('Feedback submitted successfully!');
      await fetchEvents(); // Refresh events
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit feedback';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchEvents();
    }
  }, [authUser]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    registerForEvent,
    submitFeedback,
    refetch: fetchEvents
  };
}
