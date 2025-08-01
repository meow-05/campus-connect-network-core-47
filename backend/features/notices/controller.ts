
import { NoticesService } from "./service";
import { NoticeFilters, CreateNoticeRequest, UpdateNoticeRequest } from "./types";

export class NoticesController {
  private service: NoticesService;

  constructor() {
    this.service = new NoticesService();
  }

  async getAllNotices(filters: NoticeFilters, userId?: string) {
    try {
      // Add user context to filters if needed
      const contextFilters = { ...filters };
      
      // If isMyNotices is true, filter by posted_by
      if (filters.isMyNotices && userId) {
        // This would need to be handled in the service layer with proper RLS
        contextFilters.isMyNotices = true;
      }

      return await this.service.getNotices(contextFilters);
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  }

  async getNoticeById(id: string) {
    try {
      return await this.service.getNotice(id);
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  }

  async createNotice(notice: CreateNoticeRequest, userId: string) {
    try {
      return await this.service.createNotice(notice, userId);
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  async updateNotice(id: string, updates: UpdateNoticeRequest) {
    try {
      return await this.service.updateNotice(id, updates);
    } catch (error) {
      console.error('Error updating notice:', error);
      throw error;
    }
  }

  async deleteNotice(id: string) {
    try {
      return await this.service.deleteNotice(id);
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }

  async getCategories(collegeId?: string) {
    try {
      return await this.service.getCategories(collegeId);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async uploadAttachment(file: File) {
    try {
      return await this.service.uploadAttachment(file);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }
}

// Export default instance
export default function noticesController() {
  return new NoticesController();
}
