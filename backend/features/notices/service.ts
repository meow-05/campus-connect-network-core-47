
import { db } from "@/backend/supabaseClient";
import { NoticeFilters, NoticeWithCategory, CreateNoticeRequest, UpdateNoticeRequest } from "./types";

export class NoticesService {
  async getNotices(filters: NoticeFilters = {}): Promise<NoticeWithCategory[]> {
    let query = db
      .from('notices')
      .select(`
        *,
        notice_categories(name),
        users(display_name, email)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.collegeId) {
      query = query.eq('college_id', filters.collegeId);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.isImportantOnly) {
      query = query.eq('is_pinned', true);
    }

    if (filters.targetRole) {
      query = query.contains('target_roles', [filters.targetRole]);
    }

    if (filters.targetDepartment) {
      query = query.contains('target_department_ids', [filters.targetDepartment]);
    }

    if (filters.targetSemester) {
      query = query.contains('target_semesters', [filters.targetSemester]);
    }

    // Filter out expired notices
    query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch notices: ${error.message}`);
    }

    return data || [];
  }

  async getNotice(id: string): Promise<NoticeWithCategory | null> {
    const { data, error } = await db
      .from('notices')
      .select(`
        *,
        notice_categories(name),
        users(display_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch notice: ${error.message}`);
    }

    return data;
  }

  async createNotice(notice: CreateNoticeRequest, userId: string): Promise<NoticeWithCategory> {
    const { data, error } = await db
      .from('notices')
      .insert({
        ...notice,
        posted_by: userId,
        priority: notice.is_pinned ? 1 : 2,
      })
      .select(`
        *,
        notice_categories(name),
        users(display_name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create notice: ${error.message}`);
    }

    return data;
  }

  async updateNotice(id: string, updates: UpdateNoticeRequest): Promise<NoticeWithCategory> {
    const { data, error } = await db
      .from('notices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        notice_categories(name),
        users(display_name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update notice: ${error.message}`);
    }

    return data;
  }

  async deleteNotice(id: string): Promise<void> {
    const { error } = await db
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete notice: ${error.message}`);
    }
  }

  async getCategories(collegeId?: string): Promise<{ id: string; name: string; college_id: string }[]> {
    let query = db
      .from('notice_categories')
      .select('id, name, college_id')
      .order('name');

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  }

  async uploadAttachment(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `attachments/${fileName}`;

    const { error: uploadError } = await db.storage
      .from('notice-attachments')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload attachment: ${uploadError.message}`);
    }

    const { data } = db.storage
      .from('notice-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

// Export default instance
export default function noticesService() {
  return new NoticesService();
}
