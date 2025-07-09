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

  const fetchEvents = async (filter?: string) => {
    if (!authUser) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch all events based on RLS policies
      let query = supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      // Apply filtering based on user requirements
      if (filter && filter !== 'all' && filter !== 'events-for-me') {
        const now = new Date().toISOString();
        
        switch (filter) {
          case 'upcoming':
            query = query.gt('start_time', now);
            break;
          case 'past':
            query = query.lt('end_time', now);
            break;
          case 'registered':
            // This will be handled in the frontend filtering
            break;
        }
      }

      const { data: eventsData, error } = await query;

      if (error) {
        throw error;
      }

      // Enhance events with registration data
      const processedEvents = await Promise.all((eventsData || []).map(async (event) => {
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
          .maybeSingle();

        // Get user's feedback if exists
        const { data: userFeedback } = await supabase
          .from('event_feedback')
          .select('*')
          .eq('event_id', event.id)
          .eq('user_id', authUser.id)
          .maybeSingle();

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

  const filterEvents = (events: EventWithDetails[], filter: string, userRole?: string, userDepartmentId?: string) => {
    const now = new Date();
    
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      switch (filter) {
        case 'events-for-me':
          // Show events relevant to the user based on their role and department
          if (userRole === 'platform_admin') {
            return true; // Platform admin sees all events
          }
          if (userRole === 'faculty') {
            // Faculty see all events in their college
            return true;
          }
          if (userRole === 'student' || userRole === 'mentor') {
            // Events for their department or global events
            return !event.target_departments || event.target_departments.length === 0 || 
                   (userDepartmentId && event.target_departments.some(dept => dept === userDepartmentId));
          }
          return true;
        
        case 'upcoming':
          return eventStart > now;
        
        case 'past':
          return eventEnd < now;
        
        case 'registered':
          return event.user_registered;
        
        case 'all':
        default:
          return true;
      }
    });
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

      if (event.max_participants && event.registration_count! >= event.max_participants) {
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

    // Validate that at least one field is provided
    if (!rating && !comment?.trim()) {
      return { success: false, error: 'Please provide either a rating or comment' };
    }

    try {
      const feedbackData: any = {
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
        .maybeSingle();

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

  const deleteEvent = async (eventId: string) => {
    if (!authUser) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully!');
      await fetchEvents(); // Refresh events
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete event';
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
    filterEvents,
    registerForEvent,
    submitFeedback,
    deleteEvent,
    refetch: fetchEvents
  };
}