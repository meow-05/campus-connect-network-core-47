
import { useAuth } from './useAuth';

export function useUser() {
  const { authUser, loading, isAuthenticated } = useAuth();

  return {
    id: authUser?.id || null,
    email: authUser?.email || null,
    role: authUser?.role || null,
    department: null, // This would need to be fetched separately based on role
    collegeId: authUser?.college_id || null,
    displayName: authUser?.display_name || null,
    user: authUser,
    loading,
    isAuthenticated,
  };
}
