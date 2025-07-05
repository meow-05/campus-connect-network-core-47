
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone } from 'lucide-react';

const mockFaculty = [
  {
    id: 1,
    name: 'Dr. Sarah Wilson',
    department: 'Computer Science',
    email: 'sarah.wilson@college.edu',
    phone: '+1 (555) 123-4567',
    privilege: 'college_admin',
    courses: ['Data Structures', 'Algorithms', 'Web Development'],
    isActive: true,
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    department: 'Electronics',
    email: 'michael.chen@college.edu',
    phone: '+1 (555) 987-6543',
    privilege: 'regular',
    courses: ['Digital Electronics', 'Microprocessors'],
    isActive: true,
  },
  {
    id: 3,
    name: 'Dr. Priya Sharma',
    department: 'Mathematics',
    email: 'priya.sharma@college.edu',
    phone: '+1 (555) 456-7890',
    privilege: 'department_head',
    courses: ['Calculus', 'Linear Algebra', 'Statistics'],
    isActive: false,
  },
];

export default function FacultyManagement() {
  const getPrivilegeBadge = (privilege: string) => {
    const variants = {
      college_admin: 'default' as const,
      department_head: 'secondary' as const,
      regular: 'outline' as const,
    };
    return variants[privilege as keyof typeof variants] || 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
        <p className="text-muted-foreground">
          Manage faculty members in your college
        </p>
      </div>

      <div className="grid gap-4">
        {mockFaculty.map((faculty) => (
          <Card key={faculty.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{faculty.name}</CardTitle>
                    <CardDescription>{faculty.department}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPrivilegeBadge(faculty.privilege)}>
                    {faculty.privilege.replace('_', ' ')}
                  </Badge>
                  <Badge variant={faculty.isActive ? 'default' : 'secondary'}>
                    {faculty.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {faculty.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {faculty.phone}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Courses:</p>
                  <div className="flex flex-wrap gap-1">
                    {faculty.courses.map((course, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {course}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
