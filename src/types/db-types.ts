
// Generated Supabase types
import { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];

// Specific table types
export type User = Tables<'users'>;
export type Student = Tables<'students'>;
export type Faculty = Tables<'faculty'>;
export type Mentor = Tables<'mentors'>;
export type College = Tables<'colleges'>;
export type Event = Tables<'events'>;
export type Notice = Tables<'notices'>;
export type Project = Tables<'projects'>;
export type MentorshipSession = Tables<'mentorship_sessions'>;
export type SkillVerification = Tables<'skill_verifications'>;

// Enum types
export type UserRole = Enums<'user_role'>;
export type EventStatus = Enums<'event_status'>;
export type ProjectStatus = Enums<'project_status'>;
export type SessionStatus = Enums<'session_status'>;
