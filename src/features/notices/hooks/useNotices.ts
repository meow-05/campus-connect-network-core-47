import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesApi, NoticeFilters, NoticeWithCategory } from '@/lib/api/notices';
import { TablesInsert, TablesUpdate } from '@/types/db-types';
import { useToast } from '@/hooks/use-toast';

export function useNotices(filters: NoticeFilters = {}) {
  return useQuery({
    queryKey: ['notices', filters],
    queryFn: () => noticesApi.getNotices(filters),
  });
}

export function useNotice(id: string) {
  return useQuery({
    queryKey: ['notice', id],
    queryFn: () => noticesApi.getNotice(id),
    enabled: !!id,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notice: TablesInsert<'notices'>) => noticesApi.createNotice(notice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: "Success",
        description: "Notice created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create notice",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'notices'> }) =>
      noticesApi.updateNotice(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: "Success",
        description: "Notice updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notice",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => noticesApi.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: "Success",
        description: "Notice deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notice",
        variant: "destructive",
      });
    },
  });
}

export function useUploadAttachment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => noticesApi.uploadAttachment(file),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload attachment",
        variant: "destructive",
      });
    },
  });
}

export function useNoticeCategories(collegeId?: string) {
  return useQuery({
    queryKey: ['notice-categories', collegeId],
    queryFn: () => noticesApi.getCategories(collegeId),
  });
}

export function useColleges() {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: () => noticesApi.getColleges(),
  });
}

export function useDepartments(collegeId: string) {
  return useQuery({
    queryKey: ['departments', collegeId],
    queryFn: () => noticesApi.getDepartments(collegeId),
    enabled: !!collegeId,
  });
}