
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';

export function useStudents() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students', user?.college_id, user?.role],
    queryFn: async () => {
      console.log('Fetching students with user:', user);
      console.log('User college_id:', user?.college_id);
      console.log('User role:', user?.role);
      
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      // Build the base query
      let query = supabase
        .from('students')
        .select(`
          *,
          user:users!students_user_id_fkey (
            id,
            display_name,
            email,
            avatar_path,
            college_id
          ),
          department:college_departments!students_department_id_fkey (
            id,
            name
          )
        `);

      // Apply filtering based on user role
      if (user.role === 'platform_admin') {
        // Platform admin sees all students - no college filter
        console.log('Platform admin: fetching all students');
      } else if (user.college_id) {
        // For faculty and mentors, filter by their college
        // We need to join with users table and filter by college_id there
        console.log('Filtering students by college_id:', user.college_id);
        query = query.eq('user.college_id', user.college_id);
      } else {
        console.log('No college_id for non-admin user, returning empty array');
        return [];
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      console.log('Raw students query result:', { data, error });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No students returned from query');
        return [];
      }

      // Filter out any students with missing user or department data
      const validStudents = data.filter(student => {
        const hasUser = student.user && student.user.display_name && student.user.email;
        const hasDepartment = student.department && student.department.name;
        const isValid = hasUser && hasDepartment;
        
        if (!isValid) {
          console.log('Invalid student filtered out:', {
            student_id: student.user_id,
            has_user: !!student.user,
            user_details: student.user,
            has_department: !!student.department,
            department_details: student.department
          });
        }
        
        return isValid;
      });
      
      console.log('Valid students after filtering:', validStudents);
      console.log('Total valid students count:', validStudents.length);
      
      return validStudents;
    },
    enabled: !!user
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.college_id],
    queryFn: async () => {
      console.log('Fetching departments for college:', user?.college_id);
      
      if (!user?.college_id) {
        console.log('No college_id, returning empty departments');
        return [];
      }

      const { data, error } = await supabase
        .from('college_departments')
        .select('id, name')
        .eq('college_id', user.college_id)
        .order('name');

      console.log('Departments query result:', { data, error });

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.college_id
  });

  const reportStudentMutation = useMutation({
    mutationFn: async ({ studentId, reason, message }: {
      studentId: string;
      reason: string;
      message?: string;
    }) => {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reported_user_id: studentId,
          reported_by: user?.id!,
          role_of_reported_by: user?.role!,
          reason,
          message
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  });

  return {
    students,
    departments,
    isLoading,
    error,
    reportStudent: reportStudentMutation.mutate,
    isReporting: reportStudentMutation.isPending
  };
}
