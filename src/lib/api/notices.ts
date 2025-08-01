
import { supabase } from "@/integrations/supabase/client";
import { Notice, TablesInsert, TablesUpdate } from "@/types/db-types";

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
}

export const noticesApi = {
  async getNotices(filters: NoticeFilters = {}): Promise<NoticeWithCategory[]> {
    let query = supabase
      .from('notices')
      .select(`
        *,
        notice_categories(name),
        users!notices_posted_by_fkey(display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters.collegeId) {
      query = query.eq('college_id', filters.collegeId);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.isMyNotices) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('posted_by', user.id);
      }
    }

    if (filters.isImportantOnly) {
      query = query.eq('is_pinned', true);
    }

    // Filter out expired notices
    query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getNotice(id: string): Promise<NoticeWithCategory | null> {
    const { data, error } = await supabase
      .from('notices')
      .select(`
        *,
        notice_categories(name),
        users!notices_posted_by_fkey(display_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createNotice(notice: TablesInsert<'notices'>): Promise<Notice> {
    const { data, error } = await supabase
      .from('notices')
      .insert(notice)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNotice(id: string, updates: TablesUpdate<'notices'>): Promise<Notice> {
    const { data, error } = await supabase
      .from('notices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNotice(id: string): Promise<void> {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadAttachment(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `attachments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('notice-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('notice-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async getCategories(collegeId?: string): Promise<{ id: string; name: string; college_id: string }[]> {
    let query = supabase
      .from('notice_categories')
      .select('id, name, college_id')
      .order('name');

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getColleges(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from('colleges')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getDepartments(collegeId: string): Promise<{ id: string; name: string; code: string }[]> {
    const { data, error } = await supabase
      .from('college_departments')
      .select('id, name, code')
      .eq('college_id', collegeId)
      .order('name');

    if (error) throw error;
    return data || [];
  }
};
