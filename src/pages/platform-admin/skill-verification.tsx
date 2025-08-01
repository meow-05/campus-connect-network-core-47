
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const mockVerifications = [
  {
    id: 1,
    student: 'John Doe',
    skill: 'React Development',
    mentor: 'Dr. Sarah Wilson',
    status: 'pending',
    submittedAt: '2024-01-15',
    college: 'Tech University',
  },
  {
    id: 2,
    student: 'Jane Smith',
    skill: 'Machine Learning',
    mentor: 'Prof. Michael Chen',
    status: 'approved',
    submittedAt: '2024-01-14',
    college: 'Engineering College',
  },
  {
    id: 3,
    student: 'Alex Johnson',
    skill: 'UI/UX Design',
    mentor: 'Lisa Rodriguez',
    status: 'rejected',
    submittedAt: '2024-01-13',
    college: 'Design Institute',
  },
];

export default function PlatformAdminSkillVerification() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary' as const,
      approved: 'default' as const,
      rejected: 'destructive' as const,
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Verification Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage skill verification requests across all colleges
        </p>
      </div>

      <div className="grid gap-4">
        {mockVerifications.map((verification) => (
          <Card key={verification.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{verification.skill}</CardTitle>
                  <CardDescription>
                    Requested by {verification.student} • {verification.college}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(verification.status)}
                  <Badge variant={getStatusBadge(verification.status)}>
                    {verification.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Mentor: {verification.mentor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {verification.submittedAt}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  {verification.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline">
                        Contact Mentor
                      </Button>
                    </>
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
