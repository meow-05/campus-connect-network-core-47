
import { useAuth } from './useAuth';

export function useUser() {
  const { authUser, loading, isAuthenticated } = useAuth();

  return {
    id: authUser?.id || null,
    role: authUser?.role || null,
    department: null, // This would need to be fetched separately based on role
    collegeId: authUser?.college_id || null,
    user: authUser,
    loading,
    isAuthenticated,
  };
}
