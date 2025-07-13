
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
          department:college_departments!students_department_id_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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

  const scheduleSessionMutation = useMutation({
    mutationFn: async ({ studentId, sessionData }: {
      studentId: string;
      sessionData: {
        title: string;
        scheduledAt: string;
        requestType: string;
        notes?: string;
      };
    }) => {
      const { error } = await supabase
        .from('mentorship_sessions')
        .insert({
          title: sessionData.title,
          student_id: studentId,
          mentor_id: user?.id!,
          college_id: user?.college_id!,
          scheduled_at: sessionData.scheduledAt,
          request_type: sessionData.requestType as any,
          status: 'scheduled'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Session scheduled successfully');
    },
    onError: (error) => {
      console.error('Error scheduling session:', error);
      toast.error('Failed to schedule session');
    }
  });

  return {
    students,
    departments,
    isLoading,
    error,
    reportStudent: reportStudentMutation.mutate,
    scheduleSession: scheduleSessionMutation.mutate,
    isReporting: reportStudentMutation.isPending,
    isScheduling: scheduleSessionMutation.isPending
  };
}
