
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Event, EventFeedback } from '@/types/db-types';

interface EventWithDetails extends Event {
  registration_count?: number;
  user_registered?: boolean;
  user_feedback?: EventFeedback;
}

interface EventListProps {
  events: EventWithDetails[];
  loading?: boolean;
  onEventClick: (event: EventWithDetails) => void;
  onRegister?: (eventId: string) => void;
  userRole?: string;
}

export default function EventList({ 
  events, 
  loading, 
  onEventClick, 
  onRegister, 
  userRole 
}: EventListProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card 
          key={event.id}
          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          onClick={() => onEventClick(event)}
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

              {/* Registration Status for Students/Mentors */}
              {(userRole === 'student' || userRole === 'mentor') && (
                <div className="mt-3">
                  {event.user_registered ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Registered
                    </Badge>
                  ) : (
                    <div className="flex gap-2">
                      {event.max_participants && (event.registration_count || 0) >= event.max_participants ? (
                        <Badge variant="destructive">Full</Badge>
                      ) : onRegister ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegister(event.id);
                          }}
                        >
                          Register
                        </Button>
                      ) : null}
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
  );
}
