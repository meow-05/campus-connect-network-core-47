
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MessageCircle, UserPlus } from 'lucide-react';

const mockConnections = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Faculty',
    department: 'Computer Science',
    status: 'connected',
    mutualConnections: 5,
  },
  {
    id: 2,
    name: 'Mike Chen',
    role: 'Student',
    department: 'Electronics',
    status: 'pending',
    mutualConnections: 3,
  },
  {
    id: 3,
    name: 'Dr. Amit Patel',
    role: 'Mentor',
    department: 'Software Engineering',
    status: 'connected',
    mutualConnections: 12,
  },
];

export default function Connections() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Connect with fellow students, faculty, and mentors in your college network.
        </p>
      </div>

      <div className="grid gap-4">
        {mockConnections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{connection.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mr-2 capitalize">
                        {connection.role}
                      </Badge>
                      {connection.department}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {connection.status === 'connected' ? (
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  ) : (
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {connection.mutualConnections} mutual connections
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
