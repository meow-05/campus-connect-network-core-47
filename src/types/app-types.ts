
// React-only types
export interface AppUser {
  id: string;
  role: string;
  department?: string;
  collegeId?: string;
}

export interface DashboardData {
  // Implementation pending
}

export interface FormState {
  isLoading: boolean;
  error: string | null;
}
