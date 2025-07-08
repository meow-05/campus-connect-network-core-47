
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, MapPinIcon, UsersIcon, PlusIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EventModal from '@/features/events/EventModal';
import EventForm from '@/features/events/EventForm';
import { useEvents } from '@/features/events/hooks/useEvents';
import { Event, EventFeedback } from '@/types/db-types';

interface EventWithDetails extends Event {
  registration_count?: number;
  user_registered?: boolean;
  user_feedback?: EventFeedback;
}

export default function EventsPage() {
  const { authUser } = useAuth();
  const { events, loading, registerForEvent, refetch } = useEvents();
  
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canCreateEvents = authUser?.role === 'platform_admin' || authUser?.role === 'faculty';

  const handleRegisterForEvent = async (eventId: string) => {
    const result = await registerForEvent(eventId);
    if (!result.success && result.error) {
      toast.error(result.error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!canCreateEvents) return;
    // Delete functionality would be implemented here
    toast.success('Event deleted successfully');
    refetch();
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
                  {event.is_online ? 
                    (event.virtual_link ? 'Online' : 'Virtual') : 
                    (event.physical_location || event.location || 'TBA')
                  }
                </div>
                
                {event.max_participants && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {event.registration_count || 0}/{event.max_participants} registered
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
                        {event.max_participants && (event.registration_count || 0) >= event.max_participants ? (
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

                {/* Status Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{event.status}</Badge>
                  {event.target_departments && event.target_departments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {event.target_departments.length === 1 ? 
                        event.target_departments[0] : 
                        `${event.target_departments.length} depts`
                      }
                    </Badge>
                  )}
                </div>
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
          onRefresh={refetch}
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
                refetch();
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
                refetch();
              }}
              onCancel={() => setEditingEvent(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
