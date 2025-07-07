
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EventModal from '@/features/events/EventModal';
import EventForm from '@/features/events/EventForm';
import { Event, EventRegistration, EventFeedback } from '@/types/db-types';

interface EventWithDetails extends Event {
  registration_count?: number;
  user_registered?: boolean;
  user_feedback?: EventFeedback;
}

export default function EventsPage() {
  const { authUser } = useAuth();
  const supabase = useSupabase();
  
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canCreateEvents = authUser?.role === 'platform_admin' || authUser?.role === 'faculty';

  useEffect(() => {
    fetchEvents();
  }, [authUser]);

  const fetchEvents = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      
      // Base query for events
      let query = supabase
        .from('events')
        .select(`
          *,
          event_registrations!inner(id, user_id),
          event_feedback(id, user_id, rating, comment)
        `);

      // Apply role-based filtering
      if (authUser.role === 'student' || authUser.role === 'mentor') {
        // Students and mentors see public events or events targeting their department
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
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        return;
      }

      // Process events to add registration count and user registration status
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
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    if (!authUser) return;

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      // Check registration window
      const now = new Date();
      const registrationOpens = new Date(event.registration_opens_at || event.created_at);
      const registrationCloses = new Date(event.registration_closes_at || event.start_time);

      if (now < registrationOpens) {
        toast.error('Registration has not opened yet');
        return;
      }

      if (now > registrationCloses) {
        toast.error('Registration has closed');
        return;
      }

      // Check max participants
      if (event.max_participants && event.registration_count >= event.max_participants) {
        toast.error('Event is full');
        return;
      }

      // Check if already registered
      if (event.user_registered) {
        toast.error('You are already registered for this event');
        return;
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: authUser.id
        });

      if (error) {
        console.error('Registration error:', error);
        toast.error('Failed to register for event');
        return;
      }

      toast.success('Successfully registered for event!');
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!canCreateEvents) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete event');
        return;
      }

      toast.success('Event deleted successfully');
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    const now = new Date();
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    switch (filter) {
      case 'upcoming':
        return eventStart > now;
      case 'past':
        return eventEnd < now;
      case 'registered':
        return event.user_registered;
      case 'public':
        return event.is_public;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Discover and participate in college events
          </p>
        </div>
        
        {canCreateEvents && (
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
            {(authUser?.role === 'student' || authUser?.role === 'mentor') && (
              <SelectItem value="registered">My Registrations</SelectItem>
            )}
            <SelectItem value="public">Public Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card 
            key={event.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setSelectedEvent(event)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {event.event_type}
                  </CardDescription>
                </div>
                <Badge variant={event.is_public ? "default" : "secondary"}>
                  {event.is_public ? "Public" : "Private"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(new Date(event.start_time), 'PPP p')}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {event.is_online ? event.virtual_link ? 'Online' : 'Virtual' : event.physical_location || event.location || 'TBA'}
                </div>
                
                {event.max_participants && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {event.registration_count}/{event.max_participants} registered
                  </div>
                )}

                {/* Registration Status */}
                {(authUser?.role === 'student' || authUser?.role === 'mentor') && (
                  <div className="mt-3">
                    {event.user_registered ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Registered
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        {event.max_participants && event.registration_count >= event.max_participants ? (
                          <Badge variant="destructive">Full</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegisterForEvent(event.id);
                            }}
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={canCreateEvents ? (event) => {
            setEditingEvent(event);
            setSelectedEvent(null);
          } : undefined}
          onDelete={canCreateEvents ? handleDeleteEvent : undefined}
          onRegister={(authUser?.role === 'student' || authUser?.role === 'mentor') ? handleRegisterForEvent : undefined}
          currentUser={authUser}
          onRefresh={fetchEvents}
        />
      )}

      {/* Create Event Modal */}
      {canCreateEvents && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm
              onSuccess={() => {
                setShowCreateModal(false);
                fetchEvents();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Event Modal */}
      {canCreateEvents && editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm
              event={editingEvent}
              onSuccess={() => {
                setEditingEvent(null);
                fetchEvents();
              }}
              onCancel={() => setEditingEvent(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
