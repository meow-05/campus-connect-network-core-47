import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateNotice, useUpdateNotice, useUploadAttachment, useNoticeCategories, useColleges, useDepartments } from './hooks/useNotices';
import { NoticeWithCategory } from '@/lib/api/notices';
import { useUser } from '@/hooks/useUser';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  college_id: z.string().optional(),
  category_id: z.string().optional(),
  target_department_ids: z.array(z.string()).optional(),
  target_semesters: z.array(z.number()).optional(),
  target_roles: z.array(z.string()).min(1, 'At least one target role is required'),
  is_pinned: z.boolean().default(false),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  expires_at: z.string().optional(),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

interface NoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice?: NoticeWithCategory | null;
  onSuccess?: () => void;
}

const roleOptions = [
  { value: 'student', label: 'Students' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'mentor', label: 'Mentors' },
  { value: 'platform_admin', label: 'Platform Admins' },
];

export function NoticeModal({ open, onOpenChange, notice, onSuccess }: NoticeModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const uploadAttachment = useUploadAttachment();
  
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: colleges } = useColleges();
  const { data: categories } = useNoticeCategories(selectedCollegeId);
  const { data: departments } = useDepartments(selectedCollegeId);

  const isPlatformAdmin = user?.role === 'platform_admin';
  const isEdit = !!notice;

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: '',
      content: '',
      college_id: '',
      category_id: '',
      target_department_ids: [],
      target_semesters: [],
      target_roles: ['student'],
      is_pinned: false,
      link: '',
      expires_at: '',
    },
  });

  useEffect(() => {
    if (notice) {
      form.reset({
        title: notice.title,
        content: notice.content,
        college_id: notice.college_id,
        category_id: notice.category_id || '',
        target_department_ids: notice.target_department_ids || [],
        target_semesters: notice.target_semesters || [],
        target_roles: notice.target_roles || ['student'],
        is_pinned: notice.is_pinned || false,
        link: notice.link || '',
        expires_at: notice.expires_at ? new Date(notice.expires_at).toISOString().split('T')[0] : '',
      });
      setSelectedCollegeId(notice.college_id);
    } else {
      form.reset({
        title: '',
        content: '',
        college_id: '',
        category_id: '',
        target_department_ids: [],
        target_semesters: [],
        target_roles: ['student'],
        is_pinned: false,
        link: '',
        expires_at: '',
      });
      setSelectedCollegeId(user?.college_id || '');
    }
  }, [notice, form, user?.college_id, open]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PNG, JPEG, JPG, and WebP images are allowed",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleClose = () => {
    form.reset();
    setUploadedFile(null);
    setSelectedCollegeId('');
    onOpenChange(false);
  };

  const onSubmit = async (data: NoticeFormData) => {
    try {
      setUploading(true);
      
      let attachment_url = notice?.attachment_url;
      
      // Upload attachment if there's a new file
      if (uploadedFile) {
        attachment_url = await uploadAttachment.mutateAsync(uploadedFile);
      }

      const noticeData = {
        title: data.title,
        content: data.content,
        college_id: selectedCollegeId,
        posted_by: user?.id!,
        target_roles: data.target_roles as any,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        link: data.link || null,
        attachment_url: attachment_url || null,
        target_department_ids: data.target_department_ids?.length ? data.target_department_ids : null,
        target_semesters: data.target_semesters?.length ? data.target_semesters : null,
        category_id: data.category_id || null,
        is_pinned: data.is_pinned,
      };

      if (isEdit) {
        await updateNotice.mutateAsync({
          id: notice.id,
          updates: noticeData,
        });
      } else {
        await createNotice.mutateAsync(noticeData);
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving notice:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter notice title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter notice content"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPlatformAdmin && (
              <FormField
                control={form.control}
                name="college_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College</FormLabel>
                    <Select
                      value={selectedCollegeId}
                      onValueChange={(value) => {
                        setSelectedCollegeId(value);
                        field.onChange(value);
                        form.setValue('category_id', '');
                        form.setValue('target_department_ids', []);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colleges?.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="target_roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Roles *</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(role.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, role.value]);
                            } else {
                              field.onChange(currentValues.filter(r => r !== role.value));
                            }
                          }}
                        />
                        <label className="text-sm">{role.label}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {departments && departments.length > 0 && (
              <FormField
                control={form.control}
                name="target_department_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Departments (optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                      {departments.map((dept) => (
                        <div key={dept.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(dept.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              if (checked) {
                                field.onChange([...currentValues, dept.id]);
                              } else {
                                field.onChange(currentValues.filter(id => id !== dept.id));
                              }
                            }}
                          />
                          <label className="text-sm">{dept.name}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="target_semesters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Semesters (optional)</FormLabel>
                  <div className="flex gap-4 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                      <div key={semester} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(semester)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, semester]);
                            } else {
                              field.onChange(currentValues.filter(s => s !== semester));
                            }
                          }}
                        />
                        <label className="text-sm">Sem {semester}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_pinned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as Important</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires At (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Attachment (optional)</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Image
                </Button>
                {uploadedFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{uploadedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {notice?.attachment_url && !uploadedFile && (
                  <span className="text-sm text-muted-foreground">Current attachment available</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || createNotice.isPending || updateNotice.isPending}
              >
                {uploading ? 'Uploading...' : isEdit ? 'Update Notice' : 'Create Notice'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
