
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';

const mockSessions = [
  {
    id: 1,
    title: 'React Development Guidance',
    student: 'John Doe',
    mentor: 'Dr. Sarah Wilson',
    college: 'Tech University',
    date: '2024-01-20',
    time: '10:00 AM',
    status: 'scheduled',
    duration: '60 min',
  },
  {
    id: 2,
    title: 'Career Path Discussion',
    student: 'Jane Smith',
    mentor: 'Prof. Michael Chen',
    college: 'Engineering College',
    date: '2024-01-18',
    time: '2:00 PM',
    status: 'completed',
    duration: '45 min',
  },
  {
    id: 3,
    title: 'Project Review Session',
    student: 'Alex Johnson',
    mentor: 'Lisa Rodriguez',
    college: 'Design Institute',
    date: '2024-01-22',
    time: '11:30 AM',
    status: 'cancelled',
    duration: '30 min',
  },
];

export default function PlatformAdminMentorshipSessions() {
  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'default' as const,
      completed: 'secondary' as const,
      cancelled: 'destructive' as const,
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentorship Sessions</h1>
        <p className="text-muted-foreground">
          Monitor mentorship sessions across all colleges
        </p>
      </div>

      <div className="grid gap-4">
        {mockSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>
                    {session.student} with {session.mentor} • {session.college}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadge(session.status)}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {session.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {session.time} ({session.duration})
                  </div>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  {session.status === 'scheduled' && (
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
