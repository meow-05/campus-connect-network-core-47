
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';

export function useStudents() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students', user?.college_id],
    queryFn: async () => {
      console.log('Fetching students with college_id:', user?.college_id);
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:users!students_user_id_fkey (
            id,
            display_name,
            email,
            avatar_path
          ),
          department:college_departments (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Students query result:', { data, error });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      // Filter out any students with missing user or department data
      const validStudents = (data || []).filter(student => 
        student.user && 
        student.department && 
        typeof student.department === 'object' && 
        'name' in student.department &&
        student.department.name
      );
      
      console.log('Valid students after filtering:', validStudents);
      return validStudents;
    },
    enabled: !!user?.college_id
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.college_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('college_departments')
        .select('id, name')
        .eq('college_id', user?.college_id!)
        .order('name');

      if (error) throw error;
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
