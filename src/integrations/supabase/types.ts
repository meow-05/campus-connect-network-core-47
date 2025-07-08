export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      college_departments: {
        Row: {
          code: string
          college_id: string
          id: string
          name: string
        }
        Insert: {
          code: string
          college_id: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          college_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_departments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_path: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_path?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_path?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      event_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          event_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          college_id: string
          created_at: string
          description: string
          end_time: string
          event_type: string
          id: string
          is_online: boolean | null
          is_public: boolean | null
          location: string | null
          max_participants: number | null
          max_registrations: number | null
          organizer_id: string
          physical_location: string | null
          preparation_docs: string[] | null
          registration_closes_at: string | null
          registration_opens_at: string | null
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          target_departments:
            | Database["public"]["Enums"]["department_enum"][]
            | null
          target_years: number[] | null
          title: string
          updated_at: string
          virtual_link: string | null
        }
        Insert: {
          college_id: string
          created_at?: string
          description: string
          end_time: string
          event_type: string
          id?: string
          is_online?: boolean | null
          is_public?: boolean | null
          location?: string | null
          max_participants?: number | null
          max_registrations?: number | null
          organizer_id: string
          physical_location?: string | null
          preparation_docs?: string[] | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          target_departments?:
            | Database["public"]["Enums"]["department_enum"][]
            | null
          target_years?: number[] | null
          title: string
          updated_at?: string
          virtual_link?: string | null
        }
        Update: {
          college_id?: string
          created_at?: string
          description?: string
          end_time?: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          is_public?: boolean | null
          location?: string | null
          max_participants?: number | null
          max_registrations?: number | null
          organizer_id?: string
          physical_location?: string | null
          preparation_docs?: string[] | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          target_departments?:
            | Database["public"]["Enums"]["department_enum"][]
            | null
          target_years?: number[] | null
          title?: string
          updated_at?: string
          virtual_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          college_id: string
          created_at: string
          department_id: string
          is_mentor: boolean
          privilege: Database["public"]["Enums"]["faculty_privilege"]
          updated_at: string
          user_id: string
        }
        Insert: {
          college_id: string
          created_at?: string
          department_id: string
          is_mentor?: boolean
          privilege?: Database["public"]["Enums"]["faculty_privilege"]
          updated_at?: string
          user_id: string
        }
        Update: {
          college_id?: string
          created_at?: string
          department_id?: string
          is_mentor?: boolean
          privilege?: Database["public"]["Enums"]["faculty_privilege"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_faculty_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "college_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_availability: {
        Row: {
          day_of_week: number
          mentor_id: string
          time_slots: string[]
        }
        Insert: {
          day_of_week: number
          mentor_id: string
          time_slots: string[]
        }
        Update: {
          day_of_week?: number
          mentor_id?: string
          time_slots?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          bio: string | null
          college_id: string | null
          created_at: string
          expertise: string[]
          github_url: string | null
          is_active: boolean
          linkedin_url: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          bio?: string | null
          college_id?: string | null
          created_at?: string
          expertise: string[]
          github_url?: string | null
          is_active?: boolean
          linkedin_url?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          bio?: string | null
          college_id?: string | null
          created_at?: string
          expertise?: string[]
          github_url?: string | null
          is_active?: boolean
          linkedin_url?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentors_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          college_id: string
          created_at: string
          feedback: string | null
          id: string
          mentor_id: string
          rating: number | null
          request_type:
            | Database["public"]["Enums"]["mentorship_request_type"]
            | null
          scheduled_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          mentor_id: string
          rating?: number | null
          request_type?:
            | Database["public"]["Enums"]["mentorship_request_type"]
            | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          mentor_id?: string
          rating?: number | null
          request_type?:
            | Database["public"]["Enums"]["mentorship_request_type"]
            | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notice_categories: {
        Row: {
          college_id: string
          id: string
          name: string
        }
        Insert: {
          college_id: string
          id?: string
          name: string
        }
        Update: {
          college_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_categories_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          category_id: string | null
          college_id: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          posted_by: string
          priority: number
          target_department_ids: string[] | null
          target_roles: Database["public"]["Enums"]["user_role"][]
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          college_id: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          posted_by: string
          priority?: number
          target_department_ids?: string[] | null
          target_roles: Database["public"]["Enums"]["user_role"][]
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          college_id?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          posted_by?: string
          priority?: number
          target_department_ids?: string[] | null
          target_roles?: Database["public"]["Enums"]["user_role"][]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "notice_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          reference_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          reference_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          reference_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          access_level: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string | null
          edited: boolean | null
          id: string
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited?: boolean | null
          id?: string
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited?: boolean | null
          id?: string
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_reactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          project_id: string
          responded_at: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["collab_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          project_id: string
          responded_at?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["collab_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          project_id?: string
          responded_at?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["collab_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          college_id: string
          created_at: string
          description: string
          document_paths: string[] | null
          github_url: string | null
          id: string
          is_draft: boolean | null
          last_edited_at: string | null
          max_team_size: number | null
          required_skills: string[]
          status: Database["public"]["Enums"]["project_status"]
          team_lead: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          college_id: string
          created_at?: string
          description: string
          document_paths?: string[] | null
          github_url?: string | null
          id?: string
          is_draft?: boolean | null
          last_edited_at?: string | null
          max_team_size?: number | null
          required_skills: string[]
          status?: Database["public"]["Enums"]["project_status"]
          team_lead: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          college_id?: string
          created_at?: string
          description?: string
          document_paths?: string[] | null
          github_url?: string | null
          id?: string
          is_draft?: boolean | null
          last_edited_at?: string | null
          max_team_size?: number | null
          required_skills?: string[]
          status?: Database["public"]["Enums"]["project_status"]
          team_lead?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_lead_fkey"
            columns: ["team_lead"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_lead_fkey"
            columns: ["team_lead"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_lead_fkey"
            columns: ["team_lead"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          college_id: string | null
          created_at: string
          data: Json
          filters: Json | null
          generated_by: string
          id: string
          type: Database["public"]["Enums"]["report_type"]
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          data: Json
          filters?: Json | null
          generated_by: string
          id?: string
          type: Database["public"]["Enums"]["report_type"]
        }
        Update: {
          college_id?: string | null
          created_at?: string
          data?: Json
          filters?: Json | null
          generated_by?: string
          id?: string
          type?: Database["public"]["Enums"]["report_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_verification_sessions: {
        Row: {
          created_at: string | null
          id: string
          meeting_link: string
          scheduled_time: string
          verification_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_link: string
          scheduled_time: string
          verification_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_link?: string
          scheduled_time?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_verification_sessions_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: true
            referencedRelation: "skill_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_verifications: {
        Row: {
          college_id: string
          created_at: string
          feedback: string | null
          id: string
          proof_url: string | null
          skill_id: string | null
          skill_name: string
          status: Database["public"]["Enums"]["skill_status"]
          student_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          college_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          proof_url?: string | null
          skill_id?: string | null
          skill_name: string
          status?: Database["public"]["Enums"]["skill_status"]
          student_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          college_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          proof_url?: string | null
          skill_id?: string | null
          skill_name?: string
          status?: Database["public"]["Enums"]["skill_status"]
          student_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_college_id"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_verifications_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_verifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "skill_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          college_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          college_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          college_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skills: {
        Row: {
          is_verified: boolean | null
          last_verified_at: string | null
          skill_id: string
          student_id: string
        }
        Insert: {
          is_verified?: boolean | null
          last_verified_at?: string | null
          skill_id: string
          student_id: string
        }
        Update: {
          is_verified?: boolean | null
          last_verified_at?: string | null
          skill_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      students: {
        Row: {
          bio: string | null
          created_at: string
          department_id: string
          enrollment_number: string | null
          github_url: string | null
          graduation_year: number | null
          is_alumni: boolean | null
          linkedin_url: string | null
          portfolio_url: string | null
          resume_link: string | null
          semester: number
          skills: string[] | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department_id: string
          enrollment_number?: string | null
          github_url?: string | null
          graduation_year?: number | null
          is_alumni?: boolean | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_link?: string | null
          semester: number
          skills?: string[] | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          department_id?: string
          enrollment_number?: string | null
          github_url?: string | null
          graduation_year?: number | null
          is_alumni?: boolean | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_link?: string | null
          semester?: number
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "college_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "available_mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_path: string | null
          college_id: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_verified: boolean | null
          last_active_at: string | null
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          college_id?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          college_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users: {
        Row: {
          access_level: number | null
          email: string | null
          id: string | null
        }
        Relationships: []
      }
      available_mentors: {
        Row: {
          college_id: string | null
          department_id: string | null
          email: string | null
          expertise: string[] | null
          id: string | null
          mentor_type: string | null
          time_slots: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_faculty_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "college_departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      collab_status: "pending" | "approved" | "rejected"
      department_enum:
        | "Computer Science"
        | "Electronics"
        | "Information Technology"
        | "Civil"
        | "Mechanics"
        | "Artificial Intelligence"
      event_status: "upcoming" | "active" | "completed" | "cancelled"
      faculty_privilege: "regular" | "college_admin"
      mentorship_request_type:
        | "career_advice"
        | "skill_development"
        | "project_guidance"
        | "academic_support"
      notification_type:
        | "project_invite"
        | "skill_verified"
        | "mentorship_accepted"
        | "event_reminder"
        | "admin_alert"
      project_status: "open" | "in-progress" | "completed"
      report_type:
        | "skill_verifications"
        | "mentorship_sessions"
        | "project_completions"
        | "event_participation"
      session_status: "scheduled" | "completed" | "cancelled" | "no_show"
      skill_status: "none" | "pending" | "verified" | "rejected"
      user_role: "student" | "faculty" | "mentor" | "platform_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collab_status: ["pending", "approved", "rejected"],
      department_enum: [
        "Computer Science",
        "Electronics",
        "Information Technology",
        "Civil",
        "Mechanics",
        "Artificial Intelligence",
      ],
      event_status: ["upcoming", "active", "completed", "cancelled"],
      faculty_privilege: ["regular", "college_admin"],
      mentorship_request_type: [
        "career_advice",
        "skill_development",
        "project_guidance",
        "academic_support",
      ],
      notification_type: [
        "project_invite",
        "skill_verified",
        "mentorship_accepted",
        "event_reminder",
        "admin_alert",
      ],
      project_status: ["open", "in-progress", "completed"],
      report_type: [
        "skill_verifications",
        "mentorship_sessions",
        "project_completions",
        "event_participation",
      ],
      session_status: ["scheduled", "completed", "cancelled", "no_show"],
      skill_status: ["none", "pending", "verified", "rejected"],
      user_role: ["student", "faculty", "mentor", "platform_admin"],
    },
  },
} as const
