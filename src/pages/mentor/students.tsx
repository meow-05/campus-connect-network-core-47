
import React, { useState, useMemo } from 'react';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentsFilters } from '@/components/students/StudentsFilters';
import { useStudents } from '@/hooks/useStudents';
import { useUser } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function MentorStudents() {
  const { user } = useUser();
  const { students, departments, isLoading, error } = useStudents();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.users?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || 
        student.department_id === selectedDepartment;
      
      const matchesYear = !selectedYear || 
        student.year.toString() === selectedYear;

      return matchesSearch && matchesDepartment && matchesYear;
    });
  }, [students, searchTerm, selectedDepartment, selectedYear]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedYear('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Students</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error Loading Students</h2>
          <p className="text-muted-foreground">
            There was a problem loading the students list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="text-sm text-muted-foreground">
          {filteredStudents.length} of {students.length} students
        </div>
      </div>

      <StudentsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        departments={departments}
        onClearFilters={handleClearFilters}
      />

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {students.length === 0 ? 'No students found' : 'No students match your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.user_id}
              student={{
                ...student,
                user: {
                  id: student.users?.id || '',
                  display_name: student.users?.display_name || '',
                  email: student.users?.email || '',
                  avatar_path: student.users?.avatar_path
                },
                department: {
                  name: student.college_departments?.name || ''
                }
              }}
              userRole="mentor"
            />
          ))}
        </div>
      )}
    </div>
  );
}
