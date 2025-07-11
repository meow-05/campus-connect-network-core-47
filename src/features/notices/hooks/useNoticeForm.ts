
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const noticeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  college_id: z.string().min(1, 'College is required'),
  category_id: z.string().optional(),
  target_department_ids: z.array(z.string()).optional(),
  target_years: z.array(z.number()).optional(),
  is_pinned: z.boolean().default(false),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  expires_at: z.string().optional(),
});

export type NoticeFormData = z.infer<typeof noticeFormSchema>;

export function useNoticeForm(defaultValues?: Partial<NoticeFormData>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: '',
      content: '',
      college_id: '',
      category_id: '',
      target_department_ids: [],
      target_years: [],
      is_pinned: false,
      link: '',
      expires_at: '',
      ...defaultValues,
    },
  });

  const validateAttachment = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only PNG, JPEG, JPG, and WebP images are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  return {
    form,
    isSubmitting,
    setIsSubmitting,
    validateAttachment,
    schema: noticeFormSchema,
  };
}
