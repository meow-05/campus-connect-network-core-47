
import { Database } from "@/integrations/supabase/types";

export type Notice = Database['public']['Tables']['notices']['Row'];
export type NoticeInsert = Database['public']['Tables']['notices']['Insert'];
export type NoticeUpdate = Database['public']['Tables']['notices']['Update'];

export interface NoticeWithCategory extends Notice {
  notice_categories?: {
    name: string;
  } | null;
  users?: {
    display_name: string | null;
    email: string;
  } | null;
}

export interface NoticeFilters {
  collegeId?: string;
  categoryId?: string;
  isMyNotices?: boolean;
  isImportantOnly?: boolean;
  targetRole?: string;
  targetDepartment?: string;
  targetSemester?: number;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  college_id: string;
  category_id?: string;
  target_department_ids?: string[];
  target_semesters?: number[];
  target_roles: string[];
  is_pinned?: boolean;
  link?: string;
  attachment_url?: string;
  expires_at?: string;
}

export interface UpdateNoticeRequest {
  title?: string;
  content?: string;
  category_id?: string;
  target_department_ids?: string[];
  target_semesters?: number[];
  is_pinned?: boolean;
  link?: string;
  attachment_url?: string;
  expires_at?: string;
}
